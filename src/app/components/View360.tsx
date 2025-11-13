'use client';

import { useState, useEffect, useRef } from 'react';

interface View360Props {
  baseImagePath: string;
  sourceImagePath?: string; // For detecting file extension
  totalFrames?: number;
  frameDelay?: number;
  hasDiscount?: boolean;
  hasHit?: boolean;
}

export default function View360({ baseImagePath, sourceImagePath = '', totalFrames = 11, frameDelay = 500, hasDiscount = false, hasHit = false }: View360Props) {
  const [currentFrame, setCurrentFrame] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Refs для отслеживания мыши и сенсора
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const startXRef = useRef(0);
  const startFrameRef = useRef(1);
  const isDraggingRef = useRef(false);
  const currentFrameRef = useRef(1);
  const isAnimatingRef = useRef(false);

  /**
   * Получает отформатированное имя фрейма (frame_0001, frame_0002 и т.д.)
   */
  const getFrameName = (frameNumber: number): string => {
    // Определяем расширение из оригинального пути (sourceImagePath или baseImagePath)
    let ext = '.webp'; // Default to webp
    const pathToCheck = sourceImagePath || baseImagePath;
    
    if (pathToCheck.toLowerCase().includes('.jpg')) {
      ext = '.jpg';
    } else if (pathToCheck.toLowerCase().includes('.webp')) {
      ext = '.webp';
    }
    
    return `frame_${String(frameNumber).padStart(4, '0')}${ext}`;
  };

  /**
   * Нормализует номер фрейма в диапазон [1, totalFrames]
   */
  const normalizeFrame = (frame: number): number => {
    const normalized = frame % totalFrames;
    return normalized === 0 ? totalFrames : normalized;
  };

  /**
   * Обновляет изображение в зависимости от текущего фрейма
   */
  useEffect(() => {
    if (imageRef.current) {
      const frameName = getFrameName(currentFrame);
      const fullUrl = `${baseImagePath}/${frameName}`;
      imageRef.current.src = fullUrl;
      currentFrameRef.current = currentFrame;
      console.log('View360 loading frame:', { baseImagePath, frameName, fullUrl });
    }
  }, [currentFrame, baseImagePath]);

  /**
   * Запускает/останавливает автоматическую анимацию вращения
   */
  const toggleAnimation = () => {
    if (isAnimating) {
      // Останавливаем анимацию и возвращаемся к первому фрейму
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }
      setIsAnimating(false);
      isAnimatingRef.current = false;
      setCurrentFrame(1); // Возвращаемся к обычному фото
      currentFrameRef.current = 1;
    } else {
      // Запускаем анимацию
      setIsAnimating(true);
      isAnimatingRef.current = true;
      let frame = currentFrameRef.current;

      animationRef.current = setInterval(() => {
        frame = normalizeFrame(frame + 1);
        currentFrameRef.current = frame;
        setCurrentFrame(frame);
      }, frameDelay);
    }
  };

  /**
   * Обработка начала перетаскивания (мышь и сенсор)
   * РАБОТАЕТ ТОЛЬКО когда кнопка активна (isAnimating = true)
   */
  const handleDragStart = (e: React.MouseEvent<HTMLImageElement> | React.TouchEvent<HTMLImageElement>) => {
    // Разрешаем перетаскивание только если кнопка активна
    if (!isAnimatingRef.current) return;

    // Останавливаем автоматическое вращение, но кнопка остаётся активной
    if (animationRef.current) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }

    isDraggingRef.current = true;
    startFrameRef.current = currentFrameRef.current;

    if ('touches' in e) {
      startXRef.current = e.touches[0].clientX;
    } else {
      startXRef.current = e.clientX;
    }
  };

  /**
   * Обработка движения мыши/сенсора во время перетаскивания
   */
  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!isDraggingRef.current || !isAnimatingRef.current) return;

    let currentX = 0;
    if ('touches' in e) {
      currentX = e.touches[0].clientX;
    } else {
      currentX = (e as MouseEvent).clientX;
    }

    const deltaX = currentX - startXRef.current;
    const sensitivity = 30;
    const frameDelta = Math.round(deltaX / sensitivity);

    let newFrame = startFrameRef.current + frameDelta;
    newFrame = normalizeFrame(newFrame);

    currentFrameRef.current = newFrame;
    setCurrentFrame(newFrame);
  };

  /**
   * Обработка завершения перетаскивания
   */
  const handleDragEnd = () => {
    isDraggingRef.current = false;
  };

  /**
   * Подписываемся на события мыши/сенсора ВСЕ ВРЕМЯ (не только при драге)
   */
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleDragMove(e);
    const handleTouchMove = (e: TouchEvent) => handleDragMove(e);
    const handleMouseUp = () => handleDragEnd();
    const handleTouchEnd = () => handleDragEnd();

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isAnimating]);

  /**
   * Очищаем интервал при размонтировании компонента
   */
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full flex flex-col items-center"
    >
      {/* Изображение с поддержкой перетаскивания только когда кнопка активна */}
      <img
        ref={imageRef}
        alt="360 View"
        className={`w-full h-auto object-contain transition-all duration-100 md:pr-4 ${
          isAnimating && isDraggingRef.current ? 'cursor-grabbing opacity-90' : isAnimating ? 'cursor-grab' : 'cursor-default'
        }`}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        draggable={false}
      />

      {/* Кнопка 360° - маленькая как звёздочка */}
      <button
        onClick={toggleAnimation}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        title={isAnimating ? 'Остановить вращение' : 'Начать вращение'}
        className={`
          absolute
          ${
            hasDiscount && hasHit 
              ? 'top-32' 
              : hasDiscount || hasHit 
                ? 'top-24' 
                : 'top-16'
          }
          left-2
          w-11
          h-11
          rounded-full
          transition-all
          duration-300
          flex
          items-center
          justify-center
          shadow-md
          ${
            isAnimating
              ? 'bg-white shadow-lg'
              : isHovering
              ? 'bg-[#2c3a54] text-white shadow-lg'
              : 'bg-transparent text-[#969ead]'
          }
          hover:shadow-lg
          active:scale-95
          cursor-pointer
        `}
      >
        {/* SVG иконка 360 */}
        <svg
          fill={isAnimating ? '#2c3a54' : isHovering ? 'white' : '#969ead'}
          height="24px"
          width="24px"
          version="1.1"
          id="Layer_1"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          viewBox="0 0 480 480"
          xmlSpace="preserve"
          stroke={isAnimating || isHovering ? 'white' : '#969ead'}
        >
          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
          <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
          <g id="SVGRepo_iconCarrier">
            <g>
              <g>
                <g>
                  <path d="M391.502,210.725c-5.311-1.52-10.846,1.555-12.364,6.865c-1.519,5.31,1.555,10.846,6.864,12.364 C431.646,243.008,460,261.942,460,279.367c0,12.752-15.51,26.749-42.552,38.402c-29.752,12.82-71.958,22.2-118.891,26.425 l-40.963-0.555c-0.047,0-0.093-0.001-0.139-0.001c-5.46,0-9.922,4.389-9.996,9.865c-0.075,5.522,4.342,10.06,9.863,10.134 l41.479,0.562c0.046,0,0.091,0.001,0.136,0.001c0.297,0,0.593-0.013,0.888-0.039c49.196-4.386,93.779-14.339,125.538-28.024 C470.521,316.676,480,294.524,480,279.367C480,251.424,448.57,227.046,391.502,210.725z"></path>
                  <path d="M96.879,199.333c-5.522,0-10,4.477-10,10c0,5.523,4.478,10,10,10H138v41.333H96.879c-5.522,0-10,4.477-10,10 s4.478,10,10,10H148c5.523,0,10-4.477,10-10V148c0-5.523-4.477-10-10-10H96.879c-5.522,0-10,4.477-10,10s4.478,10,10,10H138 v41.333H96.879z"></path>
                  <path d="M188.879,280.667h61.334c5.522,0,10-4.477,10-10v-61.333c0-5.523-4.477-10-10-10h-51.334V158H240c5.523,0,10-4.477,10-10 s-4.477-10-10-10h-51.121c-5.523,0-10,4.477-10,10v122.667C178.879,276.19,183.356,280.667,188.879,280.667z M198.879,219.333 h41.334v41.333h-41.334V219.333z"></path>
                  <path d="M291.121,280.667h61.334c5.522,0,10-4.477,10-10V148c0-5.523-4.478-10-10-10h-61.334c-5.522,0-10,4.477-10,10v122.667 C281.121,276.19,285.599,280.667,291.121,280.667z M301.121,158h41.334v102.667h-41.334V158z"></path>
                  <path d="M182.857,305.537c-3.567-4.216-9.877-4.743-14.093-1.176c-4.217,3.567-4.743,9.876-1.177,14.093l22.366,26.44 c-47.196-3.599-89.941-12.249-121.37-24.65C37.708,308.06,20,293.162,20,279.367c0-16.018,23.736-33.28,63.493-46.176 c5.254-1.704,8.131-7.344,6.427-12.598c-1.703-5.253-7.345-8.13-12.597-6.427c-23.129,7.502-41.47,16.427-54.515,26.526 C7.674,252.412,0,265.423,0,279.367c0,23.104,21.178,43.671,61.242,59.48c32.564,12.849,76.227,21.869,124.226,25.758 l-19.944,22.104c-3.7,4.1-3.376,10.424,0.725,14.123c1.912,1.726,4.308,2.576,6.696,2.576c2.731,0,5.453-1.113,7.427-3.301 l36.387-40.325c1.658-1.837,2.576-4.224,2.576-6.699v-0.764c0-2.365-0.838-4.653-2.365-6.458L182.857,305.537z"></path>
                  <path d="M381.414,137.486h40.879c5.522,0,10-4.477,10-10V86.592c0-5.523-4.478-10-10-10h-40.879c-5.522,0-10,4.477-10,10v40.894 C371.414,133.009,375.892,137.486,381.414,137.486z M391.414,96.592h20.879v20.894h-20.879V96.592z"></path>
                </g>
              </g>
            </g>
          </g>
        </svg>
      </button>

      {/* Подсказка для пользователя */}
      {isAnimating && (
        <div className="mt-3 text-xs text-[#969ead] text-center opacity-70">
          Потяните влево/вправо для изменения ракурса
        </div>
      )}
    </div>
  );
}
