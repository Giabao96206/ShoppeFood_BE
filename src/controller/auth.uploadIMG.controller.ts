import { Request, Response } from "express";

export const Upload = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "Không tìm thấy ảnh!" });
    }

    const uploadedFiles = files.map((file) => ({
      filename: file.filename,
      path: file.path,
      size: file.size,
    }));

    return res.status(200).json({
      message: `Tải lên thành công ${files.length} ảnh!`,
      files: uploadedFiles,
    });
  } catch (err: any) {
    return res.status(500).json({
      message: "Lỗi server khi upload ảnh.",
      error: err.message,
    });
  }
};
