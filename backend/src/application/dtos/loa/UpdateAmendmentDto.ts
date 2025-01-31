export interface UpdateAmendmentDto {
    amendmentNumber?: string;
    documentFile?: Express.Multer.File;
    tags?: string[];
}