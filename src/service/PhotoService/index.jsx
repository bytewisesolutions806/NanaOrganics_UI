import image1 from "../../assets/images/gallery/gallery_image_1_optimized.webp";
import image2 from "../../assets/images/gallery/gallery_image_2_optimized.webp";
import image3 from "../.././../public/contact_us.svg";

// PhotoService.js - This is a custom service you would create
export const PhotoService = {
  getImagesByPage(page) {
    const images = [
      {
        id: "1",
        itemImageSrc: image1.src,
        priority: true,
        thumbnailImageSrc: "image1_thumb.jpg",
        title: "Discover",
        title2: "Nature’s Best",
        altTitle: " with Nana Organics",
        alt: "At Nana Organics, we believe in the power of nature. Explore our range of organic products that nourish your body and soul.",
        pages: ["home"],
      },
      {
        id: "2",
        itemImageSrc: image2.src,
        priority: false,
        thumbnailImageSrc: "image2_thumb.jpg",
        title: "Discover Nature’s Best with Nana Organics",
        alt: "At Nana Organics, we believe in the power of nature. Explore our range of organic products that nourish your body and soul.",
        pages: ["home"],
      },
      {
        id: "3",
        itemImageSrc: image3.src,
        thumbnailImageSrc: "image2_thumb.jpg",
        title: "Get In Touch with US",
        alt: "We're here to help. Whether you have question, need suppot, or want to know more about our services - feel free to reach out anytime",
        pages: ["contact-us"],
      },
    ];

    return images.filter((img) => img.pages.includes(page));
  },
};
