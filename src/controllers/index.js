/* eslint-disable indent */
const path = require('path');
const fs = require('fs-extra');

/**
 * Load MongoDB models.
 */
const Upload = require('.././models/Upload');

/**
 * Upoloads lising mini API Controller- Takes data from lib and returns results.
 */
exports.getUploadListData = async (req, res) => {
  try {
    // Simple query params used by table to sort,limit, and offet.
    const sort = req.query.order === 'asc' ? 1 : -1;
    const limit = parseFloat(req.query.limit);
    const offset = parseFloat(req.query.offset);
    const uploadsData = await Upload.find({ uploader: req.user.id })
      .sort({ uploadedAt: sort })
      .limit(limit)
      .skip(offset)
      .select('uploaded uploadedAt fileName size type fileExtension');

    // eslint-disable-next-line prefer-const
    let uploads = [];
    let id = 0;
    uploadsData.map(data => {
      uploads.push({
        id: (id += 1),
        file: data.fileName,
        extension: data.fileExtension,
        type: data.type,
        size: data.size,
        uploadedAt: data.uploadedAt
      });
    });

    const total = await Upload.countDocuments({
      uploader: req.user.id
    });

    res.json({
      total,
      rows: uploads
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

/**
 * Delete upload mini API - Removes a file from database and filesystem.
 */
exports.deleteSingleUpload = async (req, res) => {
  try {
    const { uploadedFile } = req.params;

    // Gets the uploaded file ext and the file names
    const uploadedFileExt = path.extname(uploadedFile);
    const uploadedFileName = uploadedFile.replace(uploadedFileExt, '');

    // Creats the paths
    const uploadedFilePath = `${path.join(
      __dirname,
      '../public'
    )}/u/${uploadedFile}`;

    // Checks if they are owner of the uplaoded file.
    const isOwner = await Upload.findOne({
      fileName: uploadedFileName,
      uploader: req.user.id
    });

    // If not owner it returns you don't own this uplaod
    if (!isOwner) {
      return res.status(404).json({
        message: `Not Found`,
        status: 404
      });
    }
    // Finds and removes the upload from the database
    const upload = await Upload.findOneAndDelete({
      fileName: uploadedFileName
    });

    if (!upload) {
      if (req.user.streamerMode) {
        return res.status(404).json({
          message: `<strong>${uploadedFileName.substring(
            0,
            3
          )}*********************</strong> was not found.`,
          status: 404
        });
      }
      return res.status(404).json({
        message: `<strong>${uploadedFileName}</strong> was not found.`,
        status: 404
      });
    }
    // Removes the uploaded file from disk
    await fs.remove(uploadedFilePath);
    if (req.user.streamerMode) {
      return res.json({
        message: `<strong>${uploadedFileName.substring(
          0,
          3
        )}*********************</strong> has been deleted.`,
        status: 200
      });
    }
    res.json({
      message: `<strong>${uploadedFileName}</strong> has been deleted.`,
      status: 200
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

/**
 * Delete all uploads - Remove all files  rom database and filesystem uplaoded by the user.
 */
exports.deleteAllUploads = async (req, res) => {
  try {
    // Find all the uploads for the user
    const uploads = await Upload.find({
      uploader: req.user.id
    });

    // If none say they can't remove due to not uplaoding anything
    if (uploads.length === 0) {
      req.flash('error', 'You have not uploaded any files.');
      return res.redirect('/');
    }
    // For each upload we will find the ext and the file name
    // Use this data to remove from both the database and disk
    uploads.map(async data => {
      try {
        const uploadedFileExt = data.fileExtension;
        const uploadedFileName = data.fileName;

        const uploadedFilePath = `${path.join(
          __dirname,
          '../public'
        )}/u/${uploadedFileName + uploadedFileExt}`;

        await Upload.findOneAndDelete({
          fileName: uploadedFileName
        });
        await fs.remove(uploadedFilePath);
      } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
      }
    });
    req.flash('success', 'All your uploads have been removed.');
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
