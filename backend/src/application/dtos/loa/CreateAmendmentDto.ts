export interface CreateAmendmentDto {
    amendmentNumber: string;
    documentFile?: Express.Multer.File;
    tags?: string[];
}