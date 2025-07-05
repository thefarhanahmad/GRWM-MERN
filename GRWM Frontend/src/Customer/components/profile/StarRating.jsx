import { FaStar, FaRegStar } from "react-icons/fa6";

const StarRating = ({ rating }) => {
  const totalStars = 5;
  const filledStars = Math.floor(rating);

  return (
    <div className="flex items-center space-x-1">
      {[...Array(totalStars)].map((_, index) => (
        <span key={index} className="text-black">
          {index < filledStars ? <FaStar className="w-5 h-5" /> : <FaRegStar className="w-5 h-5" />}
        </span>
      ))}
    </div>
  );
};

export default StarRating;
