document.addEventListener('DOMContentLoaded', () => {
    const techBox = document.querySelector('.tech-stack .card p');
    if (techBox) {
        const lines = techBox.innerHTML.split('<br>');
        let newContent = '';

        lines.forEach(line => {
            const parts = line.split(':');
            if (parts.length === 2) {
                const category = parts[0].trim();
                const skills = parts[1].split(',').map(s => 
                    `<span class="tech-tag">${s.trim()}</span>`
                ).join('');
                
                newContent += `
                    <div class="tech-group">
                        <strong>${category}</strong>
                        <div>${skills}</div>
                    </div>`;
            }
        });
        techBox.parentElement.innerHTML = newContent;
    }

    const cards = document.querySelectorAll('.card, header > *');
    cards.forEach((card, i) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `all 0.6s ease-out ${i * 0.1}s`;
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100);
    });
});