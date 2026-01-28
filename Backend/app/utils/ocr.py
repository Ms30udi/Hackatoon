import easyocr
import cv2
import os

reader = easyocr.Reader(["fr", "en"], gpu=False)

def extract_text_from_image(image_path: str) -> list[str]:
    if not os.path.exists(image_path):
        raise ValueError(f"Image file does not exist: {image_path}")

    image = cv2.imread(image_path)
    if image is None:
        raise ValueError(f"OpenCV failed to load image: {image_path}")

    results = reader.readtext(image, detail=0)
    return results
