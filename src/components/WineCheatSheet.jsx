import { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';

const WineCheatSheet = () => {
  const [wines, setWines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [expandedVarietals, setExpandedVarietals] = useState({});
  const [selectedPairing, setSelectedPairing] = useState('');
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  
  // Common food pairings for the dropdown
  const commonPairings = [
    "beef", "bison", "blue cheese", "burgers", "brie", "calamari",
    "chicken", "desserts", "escargot", "filet", "fish", "fresh salads", 
    "garlic bread", "goat cheese", "lamb", "lobster", "mussels", 
    "mushrooms", "oysters", "pad thai", "parmesan chicken", "pasta", 
    "ribs", "salmon", "scallops", "seafood", "shrimp", "sirloin", 
    "steak", "steamed fish"
  ];

  // Common wine styles for the dropdown
  const commonStyles = [
    "Crisp",
    "Dry",
    "Fruity",
    "Sweet",
    "Smooth",
    "Rich",
    "Full Bodied",
    "Dry-Medium Bodied",
    "Light",
    "Medium Bodied",
    "Off-Dry",
    "Soft"
  ];

  useEffect(() => {
    const fetchWineData = async () => {
      try {
        // Read the CSV file
        const csvData = await fetch('winelist.csv')
          .then(response => {
            if (!response.ok) {
              throw new Error('Failed to fetch CSV file');
            }
            return response.text();
          });
        
        // Parse CSV to JSON
        Papa.parse(csvData, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
          complete: (results) => {
            // Transform the data structure to match our app needs
            const transformedWines = results.data.map(wine => ({
              name: wine['WINE NAME'] || '',
              type: (wine['WINE COLOR'] || '').toLowerCase(),
              varietal: wine['VARIETAL'] || '',
              sweetness: wine['SWEETNESS'] || '',
              alcohol: wine['ALCOHOL'] || '',
              region: wine['MADE IN'] || '',
              style: wine['SYTLE'] || '', // Note: CSV has a typo in "SYTLE"
              pairings: wine['FOOD PAIRING'] || '',
              description: wine['DESCRIPTION'] || ''
            }));
            
            setWines(transformedWines);
            setLoading(false);
          },
          error: (error) => {
            setError('Error parsing CSV: ' + error.message);
            setLoading(false);
          }
        });
      } catch (err) {
        setError('Error loading wine data: ' + err.message);
        setLoading(false);
      }
    };

    fetchWineData();
  }, []);

// Filter wines based on search term, active tab, selected pairing and style
const filteredWines = wines.filter(wine => {
  const matchesSearch = 
    (wine.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (wine.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (wine.region?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (wine.varietal?.toLowerCase() || '').includes(searchTerm.toLowerCase());
  
  const matchesPairing = !selectedPairing || 
    (wine.pairings?.toLowerCase() || '').includes(selectedPairing.toLowerCase());

  const matchesStyle = selectedStyles.length === 0 || 
    selectedStyles.every(style => 
      (wine.style?.toLowerCase() || '').includes(style.toLowerCase())
    );
  
  if (activeTab === 'all') return matchesSearch && matchesPairing && matchesStyle;
  return matchesSearch && matchesPairing && matchesStyle && wine.type === activeTab;
});
  
  // First separate by type, then group by varietal
  const winesByType = {
    red: [],
    white: []
  };
  
  // Group wines by type
  filteredWines.forEach(wine => {
    const type = wine.type === 'red' ? 'red' : 'white';
    winesByType[type].push(wine);
  });
  
  // Then group by varietal within each type
  const redWinesByVarietal = {};
  const whiteWinesByVarietal = {};
  
  winesByType.red.forEach(wine => {
    const varietal = wine.varietal || 'Other';
    if (!redWinesByVarietal[varietal]) {
      redWinesByVarietal[varietal] = [];
    }
    redWinesByVarietal[varietal].push(wine);
  });
  
  winesByType.white.forEach(wine => {
    const varietal = wine.varietal || 'Other';
    if (!whiteWinesByVarietal[varietal]) {
      whiteWinesByVarietal[varietal] = [];
    }
    whiteWinesByVarietal[varietal].push(wine);
  });
  
  // Sort varietals alphabetically
  const sortedRedVarietals = Object.keys(redWinesByVarietal).sort();
  const sortedWhiteVarietals = Object.keys(whiteWinesByVarietal).sort();
  

  useEffect(() => {
    // Create a new expanded state object
    let newExpandedState = {};
    
    if (searchTerm.trim() !== '' || selectedPairing !== '' || selectedStyles.length > 0) {
      // Expand varietals with matching wines (either by search, pairing, or style)
      sortedRedVarietals.forEach(varietal => {
        const hasMatchingWine = redWinesByVarietal[varietal].some(wine => {
          const matchesSearch = searchTerm.trim() === '' || 
            (wine.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (wine.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (wine.region?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (wine.varietal?.toLowerCase() || '').includes(searchTerm.toLowerCase());
          
          const matchesPairing = selectedPairing === '' || 
            (wine.pairings?.toLowerCase() || '').includes(selectedPairing.toLowerCase());
          
          const matchesStyle = selectedStyles.length === 0 || 
            selectedStyles.every(style => 
              (wine.style?.toLowerCase() || '').includes(style.toLowerCase())
            );
          
          return matchesSearch && matchesPairing && matchesStyle;
        });
        
        if (hasMatchingWine) {
          newExpandedState[varietal] = true;
        }
      });
      
      sortedWhiteVarietals.forEach(varietal => {
        const hasMatchingWine = whiteWinesByVarietal[varietal].some(wine => {
          const matchesSearch = searchTerm.trim() === '' || 
            (wine.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (wine.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (wine.region?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (wine.varietal?.toLowerCase() || '').includes(searchTerm.toLowerCase());
          
          const matchesPairing = selectedPairing === '' || 
            (wine.pairings?.toLowerCase() || '').includes(selectedPairing.toLowerCase());
          
          const matchesStyle = selectedStyles.length === 0 || 
            selectedStyles.every(style => 
              (wine.style?.toLowerCase() || '').includes(style.toLowerCase())
            );
          
          return matchesSearch && matchesPairing && matchesStyle;
        });
        
        if (hasMatchingWine) {
          newExpandedState[varietal] = true;
        }
      });
      
      // Only update the state if we have varietals to expand
      if (Object.keys(newExpandedState).length > 0) {
        setExpandedVarietals(prev => ({...prev, ...newExpandedState}));
      }
    }
  }, [searchTerm, selectedPairing, selectedStyles, sortedRedVarietals, sortedWhiteVarietals]);
  
  // Handle search term changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsStyleDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (loading) {
    return (
      <div className="max-w-md mx-auto bg-gray-100 min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading wine data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto bg-gray-100 min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-800">
          <h2 className="text-lg font-bold mb-2">Error Loading Data</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-gray-100 min-h-screen pb-8">
      <header className="bg-red-900 text-white p-6 shadow-lg rounded-b-lg">
        <h1 className="text-2xl font-bold text-center font-serif">Lot 88 Wine Guide</h1>
        <p className="text-center text-sm mt-1 text-red-100">Find the perfect wine for your meal</p>
      </header>
      
      <div className="p-4">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search wines, regions, varietals..."
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-300 focus:border-red-500 focus:outline-none transition-all"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="pairingFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Food Pairing
          </label>
            <select
              id="pairingFilter"
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm bg-white appearance-none focus:ring-2 focus:ring-red-300 focus:border-red-500 focus:outline-none transition-all"
              value={selectedPairing}
              onChange={(e) => setSelectedPairing(e.target.value)}
            >
            <option value="">All Pairings</option>
            {commonPairings.map((pairing) => (
              <option key={pairing} value={pairing}>
                {pairing.charAt(0).toUpperCase() + pairing.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="styleFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Style
          </label>
          <div className="relative" ref={dropdownRef}>
           <button
              type="button"
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm bg-white text-left flex justify-between items-center hover:bg-gray-50 focus:ring-2 focus:ring-red-300 focus:border-red-500 focus:outline-none transition-all"
              onClick={() => setIsStyleDropdownOpen(!isStyleDropdownOpen)}
            >
              <span>{selectedStyles.length > 0 ? selectedStyles.join(', ') : 'All Styles'}</span>
              <span className="text-gray-500">{isStyleDropdownOpen ? '▼' : '▶'}</span>
            </button>
            
            {isStyleDropdownOpen && (
              <div className="absolute z-50 w-full top-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
                <div className="p-2 space-y-2">
                  {commonStyles.map((style) => (
                    <div key={style} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`style-${style}`}
                        className="h-4 w-4 text-red-900 focus:ring-red-900 border-gray-300 rounded"
                        checked={selectedStyles.includes(style)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStyles([...selectedStyles, style]);
                          } else {
                            setSelectedStyles(selectedStyles.filter(s => s !== style));
                          }
                        }}
                      />
                      <label htmlFor={`style-${style}`} className="ml-2 text-sm text-gray-700">
                        {style}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex mb-6 border-b">
          <button
            className={`flex-1 py-3 font-medium transition-all ${activeTab === 'all' ? 'text-red-900 border-b-2 border-red-900' : 'text-gray-600 hover:text-red-700'}`}
            onClick={() => setActiveTab('all')}
          >
            All Wines
          </button>
          <button
            className={`flex-1 py-3 font-medium transition-all ${activeTab === 'red' ? 'text-red-900 border-b-2 border-red-900' : 'text-gray-600 hover:text-red-700'}`}
            onClick={() => setActiveTab('red')}
          >
            Red
          </button>
          <button
            className={`flex-1 py-3 font-medium transition-all ${activeTab === 'white' ? 'text-red-900 border-b-2 border-red-900' : 'text-gray-600 hover:text-red-700'}`}
            onClick={() => setActiveTab('white')}
          >
            White
          </button>
        </div>
        
        <div className="space-y-6">
          {filteredWines.length === 0 ? (
            <div className="text-center py-16 text-gray-500 bg-white bg-opacity-50 rounded-lg shadow-sm border border-gray-200 no-results">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p className="text-lg font-medium">No wines found</p>
            <p className="mt-1">Try different search terms or filters</p>
          </div>        
          ) : (
            <>
              {/* Only show Red Wine section if we have red wines and not filtering to white only */}
              {sortedRedVarietals.length > 0 && activeTab !== 'white' && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-red-800 to-red-600 text-white p-3 rounded-lg shadow-md">Red Wines</h2>                  
                  <div className="space-y-4 pl-2">
                    {sortedRedVarietals.map(varietal => (
                      <div key={varietal} className="space-y-4">
                        <div 
                          className="sticky top-0 z-10 p-3 font-bold text-lg bg-red-100 rounded-lg shadow cursor-pointer flex justify-between items-center hover:bg-red-200 transition-all"
                          onClick={() => setExpandedVarietals(prev => ({...prev, [varietal]: !prev[varietal]}))}
                        >
                          <span>{varietal} ({redWinesByVarietal[varietal].length})</span>
                          <span className="text-gray-700">
                            {expandedVarietals[varietal] ? '▼' : '▶'}
                          </span>
                        </div>
                        
                        {expandedVarietals[varietal] && redWinesByVarietal[varietal].map((wine, index) => (
                          <div 
                            key={index} 
                            className="p-5 rounded-xl shadow-md bg-red-50 hover:shadow-lg transition-all border border-red-100 wine-card"
                          >
                            <h2 className="text-xl font-bold text-red-900 mb-2 font-serif">{wine.name}</h2>
                            <div className="grid grid-cols-2 gap-3 mt-3 text-sm bg-white bg-opacity-50 p-3 rounded-lg">                              <div>
                                <span className="font-medium">Sweetness:</span> {wine.sweetness}
                              </div>
                              <div>
                                <span className="font-medium">Alcohol:</span> {wine.alcohol}
                              </div>
                              <div>
                                <span className="font-medium">Region:</span> {wine.region}
                              </div>
                              <div>
                                <span className="font-medium">Style:</span> {wine.style}
                              </div>
                            </div>
                            <div className="mt-2 text-sm">
                              <span className="font-medium">Pairs with:</span> {wine.pairings}
                            </div>
                            <div className="mt-2 text-sm">
                              <span className="font-medium">Description:</span> {wine.description}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Only show White Wine section if we have white wines and not filtering to red only */}
              {sortedWhiteVarietals.length > 0 && activeTab !== 'red' && (
                <div>
                <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-yellow-700 to-yellow-500 text-white p-3 rounded-lg shadow-md">White Wines</h2>                  
                  <div className="space-y-4 pl-2">
                    {sortedWhiteVarietals.map(varietal => (
                      <div key={varietal} className="space-y-4">
                        <div 
                          className="sticky top-0 z-10 p-3 font-bold text-lg bg-yellow-100 rounded-lg shadow cursor-pointer flex justify-between items-center hover:bg-yellow-200 transition-all"
                          onClick={() => setExpandedVarietals(prev => ({...prev, [varietal]: !prev[varietal]}))}
                        >
                          <span>{varietal} ({whiteWinesByVarietal[varietal].length})</span>
                          <span className="text-gray-700">
                            {expandedVarietals[varietal] ? '▼' : '▶'}
                          </span>
                        </div>
                        
                        {expandedVarietals[varietal] && whiteWinesByVarietal[varietal].map((wine, index) => (
                          <div 
                            key={index} 
                            className="p-5 rounded-xl shadow-md bg-yellow-50 hover:shadow-lg transition-all border border-yellow-100 wine-card"
                          >
                            <h2 className="text-lg font-bold">{wine.name}</h2>
                            <div className="grid grid-cols-2 gap-3 mt-3 text-sm bg-white bg-opacity-50 p-3 rounded-lg">                              <div>
                                <span className="font-medium">Sweetness:</span> {wine.sweetness}
                              </div>
                              <div>
                                <span className="font-medium">Alcohol:</span> {wine.alcohol}
                              </div>
                              <div>
                                <span className="font-medium">Region:</span> {wine.region}
                              </div>
                              <div>
                                <span className="font-medium">Style:</span> {wine.style}
                              </div>
                            </div>
                            <div className="mt-2 text-sm">
                              <span className="font-medium">Pairs with:</span> {wine.pairings}
                            </div>
                            <div className="mt-2 text-sm">
                              <span className="font-medium">Description:</span> {wine.description}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WineCheatSheet;