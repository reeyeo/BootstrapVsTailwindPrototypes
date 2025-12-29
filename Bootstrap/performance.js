// Performance measurement script for Bootstrap prototype
(function() {
    'use strict';

    const metrics = {
        loadTime: 0,
        domContentLoaded: 0,
        firstPaint: 0,
        firstContentfulPaint: 0,
        bundleSize: 0
    };

    // Measure page load time
    window.addEventListener('load', function() {
        const perfData = window.performance.timing;
        metrics.loadTime = perfData.loadEventEnd - perfData.navigationStart;
        metrics.domContentLoaded = perfData.domContentLoadedEventEnd - perfData.navigationStart;
        
        // Try to get paint metrics
        if (window.performance.getEntriesByType) {
            const paintEntries = window.performance.getEntriesByType('paint');
            paintEntries.forEach(entry => {
                if (entry.name === 'first-paint') {
                    metrics.firstPaint = Math.round(entry.startTime);
                }
                if (entry.name === 'first-contentful-paint') {
                    metrics.firstContentfulPaint = Math.round(entry.startTime);
                }
            });
        }

        // Estimate bundle size (CDN resources)
        if (window.performance.getEntriesByType) {
            const resources = window.performance.getEntriesByType('resource');
            let totalSize = 0;
            resources.forEach(resource => {
                if (resource.transferSize) {
                    totalSize += resource.transferSize;
                }
            });
            metrics.bundleSize = totalSize;
        }

        displayMetrics();
        saveMetrics();
    });

    function saveMetrics() {
        // Save metrics to localStorage for comparison
        try {
            localStorage.setItem('bootstrapMetrics', JSON.stringify({
                loadTime: metrics.loadTime,
                domReady: metrics.domContentLoaded,
                firstPaint: metrics.firstPaint,
                firstContentfulPaint: metrics.firstContentfulPaint,
                bundleSize: metrics.bundleSize
            }));
        } catch (e) {
            console.log('Could not save metrics to localStorage:', e);
        }
    }

    function displayMetrics() {
        const metricsDiv = document.getElementById('metricsContent');
        if (!metricsDiv) return;

        metricsDiv.innerHTML = `
            <div class="mb-1"><strong>Load Time:</strong> ${metrics.loadTime}ms</div>
            <div class="mb-1"><strong>DOM Ready:</strong> ${metrics.domContentLoaded}ms</div>
            ${metrics.firstPaint ? `<div class="mb-1"><strong>First Paint:</strong> ${metrics.firstPaint}ms</div>` : ''}
            ${metrics.firstContentfulPaint ? `<div class="mb-1"><strong>FCP:</strong> ${metrics.firstContentfulPaint}ms</div>` : ''}
            <div class="mb-1"><strong>Bundle Size:</strong> ${(metrics.bundleSize / 1024).toFixed(2)} KB</div>
            <div><strong>Framework:</strong> Bootstrap</div>
        `;
    }

    // Measure interaction performance
    let interactionStart = 0;
    document.addEventListener('click', function(e) {
        if (e.target.tagName === 'BUTTON') {
            interactionStart = performance.now();
            setTimeout(() => {
                const interactionTime = performance.now() - interactionStart;
                console.log('Interaction response time:', interactionTime.toFixed(2), 'ms');
            }, 0);
        }
    }, true);

    // Store metrics globally for comparison
    window.bootstrapMetrics = metrics;
})();

