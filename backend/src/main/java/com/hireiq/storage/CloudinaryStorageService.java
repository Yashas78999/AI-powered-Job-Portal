package com.hireiq.storage;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryStorageService {

    private final Cloudinary cloudinary;

    public UploadResult uploadResume(MultipartFile file, Long seekerId) throws IOException {
        validateFile(file);

        Map<String, Object> options = ObjectUtils.asMap(
                "folder", "hireiq/resumes/" + seekerId,
                "resource_type", "raw",  // PDFs need resource_type: raw
                "public_id", "resume_" + System.currentTimeMillis(),
                "format", "pdf"
        );

        Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), options);

        return new UploadResult(
                (String) result.get("secure_url"),
                (String) result.get("public_id")
        );
    }

    public void deleteResume(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId,
                    ObjectUtils.asMap("resource_type", "raw"));
        } catch (IOException e) {
            log.error("Failed to delete file from Cloudinary: {}", e.getMessage());
        }
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) throw new RuntimeException("File is empty");

        String contentType = file.getContentType();
        if (contentType == null || !contentType.equals("application/pdf")) {
            throw new RuntimeException("Only PDF files are allowed");
        }

        long maxSize = 5 * 1024 * 1024; // 5MB
        if (file.getSize() > maxSize) {
            throw new RuntimeException("File size must be less than 5MB");
        }
    }

    public record UploadResult(String url, String publicId) {}
}
