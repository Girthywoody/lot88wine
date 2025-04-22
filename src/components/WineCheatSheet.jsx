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
      <div className="max-w-lg mx-auto bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-red-800 h-12 w-12"></div>
            <div className="rounded-full bg-red-700 h-12 w-12"></div>
            <div className="rounded-full bg-red-600 h-12 w-12"></div>
          </div>
          <p className="text-xl text-gray-700 font-medium">Loading your wine selection...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-xl border border-red-200 text-red-800 shadow-lg w-full">
          <div className="flex items-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-bold">Error Loading Data</h2>
          </div>
          <p className="text-gray-700">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 bg-red-700 hover:bg-red-800 text-white font-medium py-2 px-4 rounded-lg transition duration-200 shadow-md">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen pb-12">
      <header className="bg-gradient-to-r from-red-900 to-red-700 text-white p-6 shadow-lg rounded-b-xl">
        <h1 className="text-3xl font-bold text-center">Lot 88 Wine Guide</h1>
        <p className="text-center text-red-100 mt-1">Your personal sommelier</p>
      </header>
      
      <div className="p-6">
        <div className="mb-6 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by name, region, varietal..."
            className="w-full pl-10 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-200"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="pairingFilter" className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Food Pairing
          </label>
          <div className="relative">
            <select
              id="pairingFilter"
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm bg-white appearance-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-200"
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
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="styleFilter" className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Style
          </label>
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm bg-white text-left flex justify-between items-center focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-200"
              onClick={() => setIsStyleDropdownOpen(!isStyleDropdownOpen)}
            >
              <span className="truncate">{selectedStyles.length > 0 ? selectedStyles.join(', ') : 'All Styles'}</span>
              <svg className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${isStyleDropdownOpen ? 'transform rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            {isStyleDropdownOpen && (
              <div className="absolute z-50 w-full top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                <div className="p-3 space-y-2">
                  {commonStyles.map((style) => (
                    <div key={style} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`style-${style}`}
                        className="h-4 w-4 text-red-700 focus:ring-red-500 border-gray-300 rounded"
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
        
        <div className="flex mb-6">
          <button
            className={`flex-1 py-3 font-medium rounded-tl-lg rounded-bl-lg transition duration-200 ${activeTab === 'all' ? 'bg-red-800 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-red-100'}`}
            onClick={() => setActiveTab('all')}
          >
            All Wines
          </button>
          <button
            className={`flex-1 py-3 font-medium border-l border-r transition duration-200 ${activeTab === 'red' ? 'bg-red-800 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-red-100'}`}
            onClick={() => setActiveTab('red')}
          >
            Red
          </button>
          <button
            className={`flex-1 py-3 font-medium rounded-tr-lg rounded-br-lg transition duration-200 ${activeTab === 'white' ? 'bg-red-800 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-red-100'}`}
            onClick={() => setActiveTab('white')}
          >
            White
          </button>
        </div>
        
        <div className="space-y-8">
          {filteredWines.length === 0 ? (
            <div className="text-center py-12 px-4 bg-white rounded-xl shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-red-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <p className="text-xl text-gray-600 font-medium">No wines found</p>
              <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              {/* Only show Red Wine section if we have red wines and not filtering to white only */}
              {sortedRedVarietals.length > 0 && activeTab !== 'white' && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-5 bg-gradient-to-r from-red-800 to-red-600 text-white py-3 px-4 rounded-lg shadow-md">
                    Red Wines
                  </h2>
                  
                  <div className="space-y-6 pl-2">
                    {sortedRedVarietals.map(varietal => (
                      <div key={varietal} className="space-y-4">
                        <div 
                          className="sticky top-0 z-10 p-3 font-bold text-lg bg-gradient-to-r from-red-100 to-white rounded-lg shadow-sm cursor-pointer flex justify-between items-center transition duration-200 hover:shadow-md"
                          onClick={() => setExpandedVarietals(prev => ({...prev, [varietal]: !prev[varietal]}))}
                        >
                          <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            {varietal} <span className="ml-2 text-sm font-normal text-gray-500">({redWinesByVarietal[varietal].length})</span>
                          </span>
                          <span className={`text-red-700 transition-transform duration-200 ${expandedVarietals[varietal] ? 'transform rotate-180' : ''}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </span>
                        </div>
                        
                        {expandedVarietals[varietal] && (
                          <div className="grid grid-cols-1 gap-4">
                            {redWinesByVarietal[varietal].map((wine, index) => (
                              <div 
                                key={index} 
                                className="p-5 rounded-xl shadow-md bg-white hover:shadow-lg transition duration-200 border-l-4 border-red-700"
                              >
                                <h2 className="text-xl font-bold text-red-900">{wine.name}</h2>
                                <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                                  <div className="flex items-center">
                                    <span className="font-medium text-gray-700 mr-2">Sweetness:</span> 
                                    <span className="text-gray-800">{wine.sweetness}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <span className="font-medium text-gray-700 mr-2">Alcohol:</span> 
                                    <span className="text-gray-800">{wine.alcohol}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <span className="font-medium text-gray-700 mr-2">Region:</span> 
                                    <span className="text-gray-800">{wine.region}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <span className="font-medium text-gray-700 mr-2">Style:</span> 
                                    <span className="text-gray-800">{wine.style}</span>
                                  </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                  <div className="mb-2">
                                    <span className="font-medium text-gray-700 inline-block mb-1">Pairs with:</span> 
                                    <span className="text-gray-800 block">{wine.pairings}</span>
                                  </div>
                                  <div className="mt-3">
                                    <span className="font-medium text-gray-700 inline-block mb-1">Description:</span> 
                                    <span className="text-gray-800 block">{wine.description}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      <footer className="mt-12 p-6 text-center text-gray-500 text-sm">
        <p>Lot 88 Wine Guide © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default WineCheatSheet;