document.addEventListener('DOMContentLoaded', function() {
            const burgerMenu = document.querySelector('.burger-menu');
            const sideMenu = document.getElementById('side-menu');
        
            burgerMenu.addEventListener('click', toggleMenu);
        
            function toggleMenu(event) {
                event.stopPropagation();
                
        
                if (sideMenu.style.display === 'flex') {
                    closeMenu();
                    burgerMenu.classList.remove('open');
                } else {
                    openMenu();
                    burgerMenu.classList.add('open');
                }
            }
        
            function openMenu() {
                sideMenu.style.display = 'flex';
                setTimeout(() => {
                    sideMenu.style.height = sideMenu.scrollHeight + 'px';
                }, 10); // Small delay to ensure display: flex has taken effect
                document.addEventListener('click', closeMenuOnOutsideClick);
            }
        
            function closeMenu() {
                sideMenu.style.height = '0';
                setTimeout(() => {
                    sideMenu.style.display = 'none';
                }, 300); // Wait for transition to finish
                document.removeEventListener('click', closeMenuOnOutsideClick);
            }
        
            function closeMenuOnOutsideClick(event) {
                if (!sideMenu.contains(event.target) && !burgerMenu.contains(event.target)) {
                    burgerMenu.classList.remove('open');
                    closeMenu();
                }
            }
        });