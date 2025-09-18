interface CategoryCardProps {
  title: string;
  description: string;
  image: string;
  itemCount: number;
}

const CategoryCard = ({ title, description, image, itemCount }: CategoryCardProps) => {
  return (
    <div className="gear-card group cursor-pointer overflow-hidden">
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-adventure"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-card-foreground mb-2">
          {title}
        </h3>
        <p className="text-muted-foreground mb-3">
          {description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {itemCount} items available
          </span>
          <span className="text-primary font-medium hover:text-primary-glow transition-adventure">
            Explore →
          </span>
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;