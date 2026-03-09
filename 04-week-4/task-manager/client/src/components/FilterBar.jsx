function FilterBar({ filters, setFilters, onNewClick }) {
    const handleChange = (field, value) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <div className="filter-bar">
            {/* Category dropdown */}
            <select
                className="filter-bar__select filter-bar__select--category"
                value={filters.category}
                onChange={(e) => handleChange('category', e.target.value)}
            >
                <option value="">Tüm Kategoriler</option>
                <option value="İş">İş</option>
                <option value="Kişisel">Kişisel</option>
                <option value="Okul">Okul</option>
            </select>

            {/* Priority dropdown */}
            <select
                className="filter-bar__select filter-bar__select--priority"
                value={filters.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
            >
                <option value="">Tüm Öncelikler</option>
                <option value="Düşük">Düşük</option>
                <option value="Orta">Orta</option>
                <option value="Yüksek">Yüksek</option>
                <option value="Acil">Acil</option>
            </select>

            {/* Search input */}
            <input
                type="text"
                className="filter-bar__search"
                placeholder="Görev ara..."
                value={filters.search}
                onChange={(e) => handleChange('search', e.target.value)}
            />

            {/* + Yeni button */}
            <button className="filter-bar__new-btn" onClick={onNewClick}>
                + Yeni
            </button>
        </div>
    );
}

export default FilterBar;
