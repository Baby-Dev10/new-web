import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface ImageCarouselProps {
  images: string[];
  removable?: boolean;
  onRemove?: (index: number) => void;
}

export function ImageCarousel({ images, removable, onRemove }: ImageCarouselProps) {
  
  const settings = {
    dots: true,
    infinite: images.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  return (
    <Slider {...settings}>
      {images.map((image, index) => (
        <div key={index} className="relative">
          <img
            src={image || "/placeholder.svg"}
            alt={`Product image ${index + 1}`}
            className="h-40 w-40 object-cover"  // nearly square
          />
          {removable && onRemove && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center z-10"
            >
              &times;
            </button>
          )}
        </div>
      ))}
    </Slider>
  );
}