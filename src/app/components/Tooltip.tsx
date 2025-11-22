// src/app/components/Tooltip.tsx
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

interface TooltipProps {
    isOpen: boolean;
    image?: string;
    description: string;
    position: { top: number; left: number }; // Эти координаты должны быть относительно родительского элемента с position: relative
    absolutePosition: { top: number; left: number };
}

// Определите тип для ref, который будет передан Tooltip
const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(({ isOpen, image, description, position, absolutePosition }, ref) => {
    const [isTablet, setIsTablet] = useState(false);
    const [positionType, setPositionType] = useState<'top' | 'bottom'>('top');
    const [tooltipStyle, setTooltipStyle] = useState({
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translate(-50%, -100%)',
    });
    const [arrowStyle, setArrowStyle] = useState({
        top: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
    });

    // Внутренний ref для DOM-элемента тултипа
    const tooltipRef = useRef<HTMLDivElement>(null);

    // Связываем переданный ref с DOM-элементом тултипа
    useImperativeHandle(ref, () => tooltipRef.current!);

    // Для адаптивности
    useEffect(() => {
        const checkScreenSize = () => {
            const width = window.innerWidth;
            setIsTablet(width < 1024);
        };
        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);
        return () => window.removeEventListener("resize", checkScreenSize);
    }, []);

    // Эффект для расчета позиции и смещения стрелки
    useEffect(() => {
        if (!isOpen) return;

        const calculateAndSetStyles = () => {
            if (!tooltipRef.current) return;

            const tooltipRect = tooltipRef.current.getBoundingClientRect();
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;

            let newLeft = position.left;
            let newTop = position.top;
            let arrowLeft = '50%';
            let arrowTransform = 'translateX(-50%)';
            let newPositionType: 'top' | 'bottom' = 'top';

            // Используем absolutePosition для расчёта места!
            const spaceAbove = absolutePosition.top; // ← теперь правильно!
            const spaceBelow = windowHeight - absolutePosition.top;

            if (spaceAbove < tooltipRect.height + 20) {
                newPositionType = 'bottom';
                // Но позиционируем относительно контейнера!
                newTop = position.top + 45; // смещение вниз от ?
            } else {
                newPositionType = 'top';
                newTop = position.top - tooltipRect.height - 10; // смещение вверх
            }

            // Адаптация для планшетов
            if (isTablet) {
                newLeft = 0;
                arrowLeft = `${position.left - 7}px`;
                arrowTransform = 'none';
            } else {
                // Проверка границ окна
                if (newLeft + tooltipRect.width / 2 > windowWidth) {
                    newLeft = windowWidth - tooltipRect.width / 2;
                }
                if (newLeft - tooltipRect.width / 2 < 0) {
                    newLeft = tooltipRect.width / 2;
                }
                arrowLeft = `${position.left - newLeft + tooltipRect.width / 2 - 7}px`;
                arrowTransform = 'none';
            }

            // Обновляем стили
            setTooltipStyle({
                top: `${newTop}px`,
                left: `${newLeft}px`,
                transform: isTablet ? 'translate(0, 0)' : 'translate(-50%, 0)',
            });

            setArrowStyle({
                top: newPositionType === 'top' ? '100%' : '-8px',
                left: arrowLeft,
                transform: arrowTransform,
            });

            setPositionType(newPositionType);
        };

        calculateAndSetStyles();

        window.addEventListener('resize', calculateAndSetStyles);
        return () => window.removeEventListener('resize', calculateAndSetStyles);
    }, [position, isTablet, isOpen]);

    if (!isOpen) return null;

    return (
        <div
            ref={tooltipRef} // Важно: ref установлен на DOM-элемент
            className="absolute z-50 bg-[#2c3a54] rounded-lg p-4 shadow-lg max-w-xs"
            style={{ ...tooltipStyle }}
        >
            {/* Стрелка */}
            <div
                className={`absolute w-0 h-0 border-l-[8px] border-[#2c3a54] border-r-[8px] ${positionType === 'top'
                    ? 'border-t-[8px] border-l-transparent border-r-transparent'
                    : 'border-b-[8px] border-l-transparent border-r-transparent top-[-8px]'
                    }`}
                style={{
                    ...arrowStyle,
                    zIndex: 1,
                }}
            ></div>

            {image && (
                <img
                    src={image}
                    alt="Информация"
                    className="w-full h-auto object-contain mb-2 rounded-lg" loading="lazy"
                />
            )}
            <p className="text-sm">{description}</p>
        </div>
    );
});

// Важно: Укажите displayName для лучшей отладки
Tooltip.displayName = 'Tooltip';

export default Tooltip; // Tooltip теперь правильно передаёт ref