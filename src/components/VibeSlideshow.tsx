import { useState, useEffect } from 'react';
import '../styles/slideshow.css';

const SLIDES = [
  {
    image: '/kwagavo/real_bags.jpg',
    title: 'Vibe in Every Pack',
    description: 'Premium branded packaging, keeping your food hot and fresh.'
  },
  {
    image: '/kwagavo/real_loaded_fries.jpg',
    title: 'Ready for Delivery',
    description: 'Hot, saucy loaded fries packed and ready to hit the road.'
  },
  {
    image: '/kwagavo/real_kachumbari.jpg',
    title: 'Freshly Chopped Daily',
    description: 'Crisp tomatoes, red onions, and coriander made fresh every single morning.'
  },
  {
    image: '/kwagavo/real_avocado.jpg',
    title: 'Always Rich & Creamy',
    description: 'Only the best, hand-picked avocados to pair with your favorite meals.'
  },
  {
    image: '/kwagavo/real_chicken_potatoes.jpg',
    title: 'Authentic Chicken & Roast Potatoes',
    description: 'Perfectly roasted leg quarter served with herb-tossed potatoes and fresh cucumber salad.'
  },
  {
    image: '/kwagavo/real_jollof_chicken.jpg',
    title: 'Flame-Grilled Chicken with Jollof',
    description: 'Spiced rice paired with juicy flame-grilled chicken, topped with fresh herbs and a hint of lime.'
  },
  {
    image: '/kwagavo/real_meat_cabbage.jpg',
    title: 'Beef Stew & Spiced Rice',
    description: 'Slow-cooked beef curry served with seasoned long-grain rice and crisp cabbage.'
  },
  {
    image: '/kwagavo/real_chicken_rice_potatoes.jpg',
    title: 'White Rice & Chicken Stew',
    description: 'Tasty grilled chicken leg quarter served with fluffy rice and savory stewed potatoes.'
  },
  {
    image: '/kwagavo/real_beans_rice_avocado.jpg',
    title: 'Home-Style Beans & Avocado',
    description: 'Wholesome bean stew paired with white rice and fresh sliced avocado.'
  },
  {
    image: '/kwagavo/real_jollof_chicken_dish.jpg',
    title: 'Savory Chicken & Spiced Jollof',
    description: 'Deliciously seasoned Jollof rice with two roasted chicken thighs and a side of fresh kachumbari.'
  },
  {
    image: '/kwagavo/real_chicken_chapati.jpg',
    title: 'Chicken Curry & Chapatis',
    description: 'Tender chicken pieces simmered in rich gravy, served with soft, layered wheat chapatis.'
  },
  {
    image: '/kwagavo/real_boat_fries.jpg',
    title: 'Boat Loaded Fries',
    description: 'Crispy golden french fries loaded with minced meat, cheese sauce, and diced onions/tomatoes.'
  },
  {
    image: '/kwagavo/real_beef_rice_potatoes.jpg',
    title: 'Home-Style Beef Stew Platter',
    description: 'Steamed white rice served with slow-cooked beef curry, potato chunks, and fresh tomatoes.'
  },
  {
    image: '/kwagavo/real_samosas_plate.jpg',
    title: 'Crispy Golden Samosas',
    description: 'Perfect snack side of three deep-fried samosas stuffed with seasoned minced meat.'
  }
];

export default function VibeSlideshow() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % SLIDES.length);
    }, 4500); // cycle every 4.5s
    return () => clearInterval(interval);
  }, []);

  const handleDotClick = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <section className="vibe-slideshow" aria-label="Kwa Gavo Vibe Gallery">
      <h4 className="vibe-slideshow__title">✦ From the Joint</h4>
      
      <div className="vibe-slideshow__container">
        {SLIDES.map((slide, idx) => {
          let position = 'next';
          if (idx === activeIndex) position = 'active';
          else if (idx === (activeIndex - 1 + SLIDES.length) % SLIDES.length) position = 'prev';

          // Only set background-image for active + neighbour slides.
          // This prevents 14 eager image requests on page load.
          const shouldLoad = position === 'active' || position === 'prev';
          const nextIdx = (activeIndex + 1) % SLIDES.length;
          const isNext = idx === nextIdx;

          return (
            <div
              key={slide.image}
              className={`vibe-slide vibe-slide--${position}`}
              style={
                shouldLoad || isNext
                  ? { backgroundImage: `url(${slide.image})` }
                  : undefined
              }
            >
              <div className="vibe-slide__overlay">
                <div className="vibe-slide__content">
                  <h5 className="vibe-slide__headline font-headline-sm">{slide.title}</h5>
                  <p className="vibe-slide__text font-body-sm">{slide.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="vibe-slideshow__dots">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            className={`vibe-slideshow__dot ${idx === activeIndex ? 'vibe-slideshow__dot--active' : ''}`}
            onClick={() => handleDotClick(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
