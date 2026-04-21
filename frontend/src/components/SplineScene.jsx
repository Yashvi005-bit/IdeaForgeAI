// src/components/SplineScene.jsx
import React, { Suspense, lazy } from 'react';

const Spline = lazy(() => import('@splinetool/react-spline'));

/**
 * A lazy-loaded Spline scene component.
 *
 * IMPORTANT: The parent container MUST have explicit width and height.
 * The Spline canvas expands to fill its parent — if the parent has
 * 0 height, you'll see nothing.
 */
export function SplineScene({ scene, className, onLoad }) {
    // Aggressive recursive logo removal
    const handleLoad = (app) => {
        if (onLoad) onLoad(app);
        
        const nukeWatermark = (root) => {
            if (!root) return;
            
            // Try to find the watermark in this root
            const logo = root.querySelector('#spline-watermark, a[href*="spline.design"], .spline-watermark');
            if (logo) {
                logo.style.display = 'none';
                logo.style.visibility = 'hidden';
                logo.style.opacity = '0';
                logo.style.pointerEvents = 'none';
            }

            // Recurse into all elements that might have their own shadow roots
            const elements = root.querySelectorAll('*');
            elements.forEach(el => {
                if (el.shadowRoot) {
                    nukeWatermark(el.shadowRoot);
                }
            });
        };

        const runNuke = () => nukeWatermark(document);

        // Run immediately and periodically
        runNuke();
        const interval = setInterval(runNuke, 500);

        return () => {
            clearInterval(interval);
        };
    };

    return (
        <Suspense
            fallback={
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'transparent',
                    }}
                >
                    <LoadingSpinner />
                </div>
            }
        >
            <Spline scene={scene} className={className} onLoad={handleLoad} />
        </Suspense>
    );
}

/** Simple CSS spinner — no dependencies */
function LoadingSpinner() {
    return (
        <span
            style={{
                width: 40,
                height: 40,
                border: '3px solid rgba(255, 255, 255, 0.2)',
                borderTopColor: '#00d4ff', // Matches the theme
                borderRadius: '50%',
                animation: 'spline-spin 0.8s linear infinite',
            }}
        />
    );
}

/**
 * Inject the spinner keyframes into the document.
 * This runs once on module load — no side effects on re-render.
 */
if (typeof document !== 'undefined') {
    const styleId = 'spline-scene-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
      @keyframes spline-spin {
        to { transform: rotate(360deg); }
      }
    `;
        document.head.appendChild(style);
    }
}
