import { gridItems } from "@/data";
import { BentoGrid, BentoGridItem } from "./ui/BentoGrid";
import MagicButton  from "./MagicButton";

const Grid = () => {
  return (
    <section id="about">
      <BentoGrid className="w-full py-20">
        {gridItems.map((item, i) => (
          <BentoGridItem
            id={item.id}
            key={i}
            title={item.title}
            description={item.description}
            className={item.className}
            img={item.img}
            imgClassName={item.imgClassName}
            titleClassName={item.titleClassName}
            spareImg={item.spareImg}
          >
            {item.id === 5 && (
              <div className="mt-4">
                <MagicButton 
                  title="View my Blog" 
                  icon={null} 
                  position="center" 
                  handleClick={() => window.location.href = '/blog'} 
                />
              </div>
            )}
          </BentoGridItem>
        ))}
      </BentoGrid>
    </section>
  );
};

export default Grid;
