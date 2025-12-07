function drawIcon(canvas, circular = false) {
    const ctx = canvas.getContext('2d');
    const size = canvas.width;

    if (circular) {
        // Circular version with clipping
        ctx.save();
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.clip();
    }

    // White background
    ctx.fillStyle = 'white';
    if (circular) {
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.fill();
    } else {
        ctx.fillRect(0, 0, size, size);
    }

    if (!circular) {
        // Optional: Add subtle border for better visibility on white backgrounds
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = size * 0.01;
        ctx.strokeRect(0, 0, size, size);
    }

    ctx.fillStyle = '#667eea';
    ctx.font = `bold ${size * 0.65}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Center the emoji more precisely (emojis often have extra space at bottom)
    // Adjust Y position slightly up for better visual centering
    const yOffset = size * 0.55;
    ctx.fillText('🎵', size / 2, yOffset);

    if (circular) {
        ctx.restore();
    }
}

function downloadIcon(canvasId, filename) {
    const canvas = document.getElementById(canvasId);
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();
}

// Draw icons on page load
window.addEventListener('load', () => {
    // Main download icons
    drawIcon(document.getElementById('icon192'));
    drawIcon(document.getElementById('icon512'));

    // Format preview icons
    drawIcon(document.getElementById('icon16'));
    drawIcon(document.getElementById('icon32'));
    drawIcon(document.getElementById('iconAndroid'));
    drawIcon(document.getElementById('iconIOS'));
    drawIcon(document.getElementById('iconAndroidCircular'), true); // Circular version
});
