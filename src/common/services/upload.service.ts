import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly publicUrl: string;
  private readonly MAX_FILE_SIZE = 6 * 1024 * 1024; // 6MB
  private readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/tiff',
  ];

  constructor(private configService: ConfigService) {
    const accountId = this.configService.get<string>('R2_ACCOUNT_ID') || '';
    const accessKeyId =
      this.configService.get<string>('R2_ACCESS_KEY_ID') || '';
    const secretAccessKey =
      this.configService.get<string>('R2_SECRET_ACCESS_KEY') || '';

    this.bucketName = this.configService.get<string>('R2_BUCKET_NAME') || '';
    this.publicUrl = this.configService.get<string>('R2_PUBLIC_URL') || '';

    if (!accountId || !accessKeyId || !secretAccessKey || !this.bucketName) {
      this.logger.warn(
        'R2 configuration is incomplete. File upload will not work.',
      );
    }

    // Configurar cliente S3 para Cloudflare R2
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  /**
   * Sube una imagen desde Base64, la valida, comprime y convierte a WebP
   * @param base64Data - String Base64 de la imagen (con o sin prefijo data:image/...)
   * @param folder - Carpeta dentro del bucket (ej: 'users', 'providers')
   * @returns URL pública de la imagen subida
   */
  async uploadImageFromBase64(
    base64Data: string,
    folder: string,
  ): Promise<string> {
    try {
      // Extraer el MIME type y los datos Base64
      let mimeType: string;
      let base64Content: string;

      if (base64Data.startsWith('data:')) {
        const matches = base64Data.match(/^data:(.+);base64,(.+)$/);
        if (!matches) {
          throw new BadRequestException('Formato de imagen Base64 inválido');
        }
        mimeType = matches[1];
        base64Content = matches[2];
      } else {
        // Asumir que es solo el contenido Base64 sin prefijo
        base64Content = base64Data;
        mimeType = 'image/jpeg'; // Default
      }

      // Validar MIME type
      if (!this.ALLOWED_MIME_TYPES.includes(mimeType)) {
        throw new BadRequestException(
          `Tipo de archivo no permitido. Formatos aceptados: JPEG, PNG, GIF, WebP, BMP, TIFF`,
        );
      }

      // Convertir Base64 a Buffer
      const imageBuffer = Buffer.from(base64Content, 'base64');

      // Validar tamaño del archivo original
      if (imageBuffer.length > this.MAX_FILE_SIZE) {
        throw new BadRequestException(
          `La imagen excede el tamaño máximo permitido de 6MB. Tamaño actual: ${(imageBuffer.length / 1024 / 1024).toFixed(2)}MB`,
        );
      }

      // Procesar y comprimir imagen a WebP
      const processedImage = await this.processImage(imageBuffer);

      // Generar nombre único para el archivo
      const fileName = `${folder}/${randomUUID()}.webp`;

      // Subir a R2
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: processedImage,
        ContentType: 'image/webp',
        CacheControl: 'public, max-age=31536000', // Cache por 1 año
      });

      await this.s3Client.send(command);

      // Retornar URL pública
      const publicUrl = `${this.publicUrl}/${fileName}`;
      this.logger.log(`Image uploaded successfully: ${publicUrl}`);

      return publicUrl;
    } catch (error) {
      this.logger.error('Error uploading image to R2', error);

      // Si es un error de validación, dejarlo pasar
      if (error instanceof BadRequestException) {
        throw error;
      }

      // Para otros errores, lanzar error genérico sin romper el flujo
      throw new InternalServerErrorException(
        'Error al procesar la imagen. Por favor, intenta con una imagen más pequeña o en otro formato.',
      );
    }
  }

  /**
   * Procesa y optimiza una imagen: redimensiona, comprime y convierte a WebP
   * @param imageBuffer - Buffer de la imagen original
   * @returns Buffer de la imagen procesada en formato WebP
   */
  private async processImage(imageBuffer: Buffer): Promise<Buffer> {
    try {
      const image = sharp(imageBuffer);
      const metadata = await image.metadata();

      // Configuración de compresión
      let pipeline = image.rotate(); // Auto-rotar según EXIF

      // Redimensionar si es muy grande (mantener aspecto ratio)
      const MAX_WIDTH = 1920;
      const MAX_HEIGHT = 1920;

      if (metadata.width > MAX_WIDTH || metadata.height > MAX_HEIGHT) {
        pipeline = pipeline.resize(MAX_WIDTH, MAX_HEIGHT, {
          fit: 'inside', // Mantener aspecto ratio
          withoutEnlargement: true, // No agrandar imágenes pequeñas
        });
      }

      // Convertir a WebP con compresión de alta calidad
      const processedBuffer = await pipeline
        .webp({
          quality: 85, // Balance entre calidad y tamaño
          effort: 4, // Esfuerzo de compresión (0-6, 4 es un buen balance)
        })
        .toBuffer();

      // Validar que el archivo procesado no exceda el límite
      if (processedBuffer.length > this.MAX_FILE_SIZE) {
        // Si aún es muy grande, reducir calidad
        return await sharp(imageBuffer)
          .rotate()
          .resize(MAX_WIDTH, MAX_HEIGHT, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality: 70, effort: 4 })
          .toBuffer();
      }

      this.logger.log(
        `Image processed: ${(imageBuffer.length / 1024).toFixed(2)}KB → ${(processedBuffer.length / 1024).toFixed(2)}KB`,
      );

      return processedBuffer;
    } catch (error) {
      this.logger.error('Error processing image with sharp', error);
      throw new BadRequestException(
        'La imagen no pudo ser procesada. Verifica que sea un archivo de imagen válido.',
      );
    }
  }

  /**
   * Elimina una imagen de R2
   * @param imageUrl - URL completa de la imagen a eliminar
   */
  async deleteImage(imageUrl: string): Promise<void> {
    try {
      if (!imageUrl || !imageUrl.startsWith(this.publicUrl)) {
        // No es una URL de R2, ignorar (puede ser una URL externa o Base64 antiguo)
        return;
      }

      // Extraer el key (ruta del archivo) de la URL
      const key = imageUrl.replace(`${this.publicUrl}/`, '');

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`Image deleted successfully: ${key}`);
    } catch (error) {
      // No lanzar error si falla la eliminación, solo log
      this.logger.warn(`Failed to delete image: ${imageUrl}`, error);
    }
  }

  /**
   * Valida si una cadena es Base64
   */
  isBase64(str: string): boolean {
    if (!str) return false;

    // Verificar si tiene el formato data:image/...;base64,...
    if (str.startsWith('data:image/')) {
      return true;
    }

    // Verificar si es Base64 puro
    try {
      const regex = /^[A-Za-z0-9+/]+=*$/;
      return regex.test(str) && str.length % 4 === 0;
    } catch {
      return false;
    }
  }
}
