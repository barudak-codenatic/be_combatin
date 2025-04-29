import { BadRequestException } from '@nestjs/common';

export const imageFileFilter = (req, file, callback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return callback(
      new BadRequestException(
        'Hanya file JPG, PNG, atau jpg yang diperbolehkan!',
      ),
      false,
    );
  }

  callback(null, true);
};
