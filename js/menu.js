export class MenuManager {
    constructor(i18n) {
        this.i18n = i18n;
        this.menuData = [];
        this.searchQuery = "";
        
        // Define the hierarchy
        this.structure = {
            'petit-dejeuner': ['petit-dejeuner', 'oeuf-au-plat', 'omelettes', 'croque', 'toast-item'],
            'fast-food': ['tacos', 'panini', 'wrap', 'sandwich', 'hamburgers'],
            'entrees': ['entrees-chaudes', 'salade'],
            'italien': ['pizza', 'pates', 'pasticcio', 'risotto'],
            'plats': ['viandes', 'volailles', 'poissons'],
            'desserts': ['crepes-salees', 'crepes-sucrees', 'glaces'],
            'boissons': ['jus-presses', 'jus-de-fruits', 'smoothies', 'milkshakes-speciaux', 'mojitos-virgin', 'ice-tea', 'ice-coffee', 'boissons-fraiches', 'boissons-chaudes']
        };
    }

    async init() {
        try {
            const response = await fetch('data/menu.json');
            this.menuData = await response.json();
            
            this.setupSearch();
            this.render();
            
            window.addEventListener('languageChanged', () => this.render());
        } catch (error) {
            console.error('Error loading menu:', error);
        }
    }

    setupSearch() {
        const searchInput = document.getElementById('search-input');
        if(searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase().trim();
                this.renderSections(); // Re-render instantly on typing
            });
        }
    }

    render() {
        this.renderNav();
        this.renderSections();
    }

    renderNav() {
        const navContainer = document.getElementById('category-nav');
        navContainer.innerHTML = '';
        
        Object.keys(this.structure).forEach(parentCat => {
            // Check if this category actually has items in the JSON
            const hasItems = this.menuData.some(item => item.category === parentCat);
            if (!hasItems) return;

            const btn = document.createElement('button');
            // Added flex-shrink-0 and snap-start to fix mobile scrolling
            btn.className = 'nav-btn flex-shrink-0 px-4 py-1.5 rounded-full border border-accent text-accent font-medium whitespace-nowrap transition-colors hover:bg-accent hover:text-white text-sm sm:text-base cursor-pointer';
            btn.textContent = this.i18n.t(`cat_${parentCat}`); 
            
            btn.onclick = () => {
                const section = document.getElementById(`section-${parentCat}`);
                if(section) {
                    const headerOffset = 140; // Offset for sticky header
                    const elementPosition = section.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.scrollY - headerOffset;
                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                }
            };
            navContainer.appendChild(btn);
        });
    }

    renderSections() {
        const container = document.getElementById('menu-container');
        const noResults = document.getElementById('no-results');
        container.innerHTML = '';
        const lang = this.i18n.currentLang;
        
        let totalRenderedItems = 0;

        Object.entries(this.structure).forEach(([parentCat, subCats]) => {
            
            // 1. Get items for this category
            let parentItems = this.menuData.filter(item => item.category === parentCat);
            
            // 2. If user is searching, filter these items based on search query
            if (this.searchQuery !== "") {
                parentItems = parentItems.filter(item => {
                    const trans = item.translations[lang] || item.translations['fr'];
                    const itemName = (trans.name || "").toLowerCase();
                    const itemIng = (trans.ingredients || "").toLowerCase();
                    return itemName.includes(this.searchQuery) || itemIng.includes(this.searchQuery);
                });
            }

            if (parentItems.length === 0) return;

            // 3. Create Section Container
            const section = document.createElement('section');
            section.id = `section-${parentCat}`;
            section.className = 'fade-in-section pt-4'; 

            // 4. Create Parent Title
            let sectionHTML = `
                <div class="mb-6">
                    <h2 class="text-3xl font-serif text-accent mb-2">${this.i18n.t(`cat_${parentCat}`)}</h2>
                    <div class="w-16 h-1 bg-secondary rounded mb-4"></div>
                </div>
            `;

            // 5. Create Subcategory Shortcut Pills (Only show if not searching)
            if (this.searchQuery === "") {
                let subNavHTML = `<div class="flex flex-wrap gap-2 mb-8">`;
                subCats.forEach(subCat => {
                    const hasSubItems = parentItems.some(i => i.subcategory === subCat);
                    if(hasSubItems) {
                        subNavHTML += `
                            <button onclick="
                                const el = document.getElementById('sub-${subCat}');
                                if(el) {
                                    const y = el.getBoundingClientRect().top + window.scrollY - 150;
                                    window.scrollTo({top: y, behavior: 'smooth'});
                                }
                            " class="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm font-medium hover:bg-secondary/50 hover:text-accent transition-colors">
                                ${this.i18n.t(`sub_${subCat}`)}
                            </button>
                        `;
                    }
                });
                subNavHTML += `</div>`;
                sectionHTML += subNavHTML;
            }

            // 6. Loop through Subcategories to render cards
            subCats.forEach(subCat => {
                const subItems = parentItems.filter(item => item.subcategory === subCat);
                if (subItems.length === 0) return;

                totalRenderedItems += subItems.length;

                sectionHTML += `
                    <div id="sub-${subCat}" class="mb-10 scroll-mt-36">
                        <h3 class="text-xl font-sans font-semibold text-gray-700 mb-6 border-b pb-2">
                            ${this.i18n.t(`sub_${subCat}`)}
                        </h3>
                      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                            ${subItems.map(item => this.createCardHTML(item, lang)).join('')}
                        </div>
                    </div>
                `;
            });

            section.innerHTML = sectionHTML;
            container.appendChild(section);
        });

        // Show/Hide "No Results" message
        if (totalRenderedItems === 0) {
            noResults.classList.remove('hidden');
        } else {
            noResults.classList.add('hidden');
        }

        this.initLazyLoading();
        this.setupScrollObserver();
    }

createCardHTML(item, lang) {
        // Safe translation fallback per item
        const translation = item.translations[lang] || item.translations['fr'];
        
        return `
            <article class="menu-card bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col group h-full">
                
                <div class="relative w-full pt-[100%] overflow-hidden bg-gray-50 flex-shrink-0">
                    <img data-src="${item.image}" alt="${translation.name || ''}" 
                         class="img-lazy absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                </div>

                <div class="p-2 md:p-5 flex flex-col flex-grow">
                    <div class="flex flex-col xl:flex-row justify-between items-start mb-1 gap-1 xl:gap-4">
                        <h3 class="text-sm md:text-lg font-semibold text-gray-800 leading-tight line-clamp-2 md:line-clamp-none" title="${translation.name || ''}">
                            ${translation.name || ''}
                        </h3>
                        <span class="text-sm md:text-lg font-bold text-accent whitespace-nowrap">
                            ${item.price} ${this.i18n.t('currency')}
                        </span>
                    </div>
                    
                    <p class="text-[11px] md:text-sm text-gray-500 mt-auto leading-tight line-clamp-2">
                        ${translation.ingredients || ''}
                    </p>
                </div>
                
            </article>
        `;
    }

    initLazyLoading() {
        const images = document.querySelectorAll('.img-lazy');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.onload = () => img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });
        images.forEach(img => imageObserver.observe(img));
    }

    setupScrollObserver() {
        const sections = document.querySelectorAll('.fade-in-section');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, { threshold: 0.05 });
        sections.forEach(sec => observer.observe(sec));
    }
}