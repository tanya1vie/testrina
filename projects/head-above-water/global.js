// LOADING JAVASCRIPT

//THESE ARE NOT WORKING YET
// document.addEventListener('DOMContentLoaded', function() {
//     function loadCSS(id, url) {
//         const elementExists = document.getElementById(id);
//         if (elementExists) {
//             const link = document.createElement('link');
//             link.rel = 'stylesheet';
//             link.href = url;
//             document.head.appendChild(link);
//         }
//     }

//     function loadJS(id, url) {
//         const elementExists = document.getElementById(id);
//         if (elementExists) {
//             const script = document.createElement('script');
//             script.src = url;
//             document.body.appendChild(script);
//         }
//     }

// // CALLING DIFFERENT JS & CSS FILES FOR DIFFERENT DIV IDs
// // WELCOME MAP
// // loadCSS('welcome-map', 'welcome-map-style.css');
// loadJS('welcome-map', 'welcome-map-script.js');

// // HISTORICAL MAP
// // loadCSS('boston-historical', 'boston-historical-style.css');
// loadJS('boston-historical', 'boston-historical-script.js');

// // LAND & POPULATION EXPANSION
// // loadCSS('boston-reclamation', 'boston-reclamation-style.css');
// loadJS('boston-reclamation', 'boston-reclamation-script.js');

// });

// SMOOTH SCROLLING SCRIPT
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      document.querySelector(targetId).scrollIntoView({
          behavior: 'smooth'
      });
  });
});

// FOR TANYA'S PART
var selectedZone = 0;
var zones = [
    "","","","Waterfront", "Waterfront", "Waterfront","Inland", "Inland", "Inland", "Inland",
    "","","","Inland", "Waterfront", "Inland","Inland", "Inland", "Inland", "Riverside",
    "","","","Inland", "Waterfront", "Waterfront","Waterfront", "Waterfront", "Riverside", "Inland",
    "","","","Inland", "Inland", "Inland","Waterfront", "Waterfront", "In the Airport", "In the Airport",
    "","","","Inland", "Riverside", "Riverside","Waterfront", "Waterfront", "In the Airport", "In the Airport",
    "","","","Riverside", "Riverside", "Inland","Waterfront", "In the Sea", "Waterfront", "In the Airport",
    "","","","Inland", "Inland", "Inland","Waterfront", "Waterfront", "Waterfront", "Waterfront",
    "","","","Inland", "Inland", "Inland","Inland", "Waterfront", "Waterfront", "In the Sea",
    "","","","Inland", "Inland", "Inland","Waterfront", "Waterfront", "In the Sea", "In the Sea",
    "","","","Inland", "Inland", "Inland","Inland", "Waterfront", "In the Sea", "In the Sea",
];
var grades = [
    "","","","C", "C", "C", "A", "A", "A",
    "","","", "A", "A", "C", "A", "A", "A", "A",
     "","","",  "B", "A", "C", "C", "C", "C", "B", "A", 
      "","","","A", "A", "A", "C", "C", "D", "D", 
    "","","", "A", "B", "B", "C", "C", "D", "D",
    "","","", "B", "B", "A", "C", "F", "C", "D", 
     "","","","A", "A", "A", "C", "C", "C", "C",
    "","","", "A", "A", "A", "A", "C", "C", "F",
     "","","", "A", "A", "A", "C", "C", "F", "F", 
     "","","","A", "A", "A", "A", "C", "F", "F"
];

function updateHeading() {
    var heading = document.getElementById("zone-heading");
    heading.innerText = zones[selectedZone];
}

function updateGrade() {
    var heading = document.getElementById("zone-grade");
    heading.innerText = grades[selectedZone];
}

// Ensure modal functions are properly defined and wired
function openModal() {
    document.querySelector('.modal-overlay').style.display = 'flex';
}

function closeModal() {
    document.querySelector('.modal-overlay').style.display = 'none';
}

// Attach event listener to close modal button explicitly
document.addEventListener("DOMContentLoaded", function() {
    updateHeading();
    updateGrade();
    createGrid();

    // Attach click event listener to close button
    document.querySelector('.close-modal').addEventListener('click', closeModal);
});

// Initialize grid flag
gridCreated = false
function createGrid() {
    if (gridCreated) {
        return; // Exit function if grid is already created
    }
    var width = 800;
    var height = 700;
    var svg = d3.select("#map")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    var rows = 10;
    var cols = 10;
    var cellWidth = width / cols;
    var cellHeight = height / rows;

    for (var row = 0; row < rows; row++) {
        for (var col = 0; col < cols; col++) {
            var x = col * cellWidth;
            var y = row * cellHeight;

            svg.append("rect")
                .attr("x", x)
                .attr("y", y)
                .attr("width", cellWidth)
                .attr("height", cellHeight)
                .attr("class", "grid-cell")
                .on("click", function() {
                    var index = parseInt(d3.select(this).attr("x")) / cellWidth +
                        (parseInt(d3.select(this).attr("y")) / cellHeight) * cols;
                        console.log(index);

                    selectedZone = index; // This might need adjustment based on actual zone calculation
                    updateHeading();
                    updateGrade();
                    openModal();
                });
        }
    }
    gridCreated = true;
}


// FOR HAIDAR'S PART
mapboxgl.accessToken = 'pk.eyJ1IjoiZWxoYXFoIiwiYSI6ImNsdDNhcThkcTF1cHEya3JvbHY4eDJtaWIifQ.JFJvJb6fqR8On7uTnx4HVA';

const map = new mapboxgl.Map({
    container: 'map-historical',
    style: 'mapbox://styles/mapbox/satellite-v9',
    center: [-71.058884, 42.360081],
    zoom: 12
});

map.on('style.load', () => {
    map.setFog({}); // Set the default atmosphere style
});

map.on('load', () => {
    // Adding raster sources and layers
    const layers = [
        { id: '1775', source: 'elhaqh.dkyujzd4' },
        { id: '1838', source: 'elhaqh.4l9l2pmj' },
        { id: '1906', source: 'elhaqh.6dftg5jc' }
    ];

    layers.forEach(layer => {
        map.addSource(layer.id, {
            'type': 'raster',
            'url': 'mapbox://' + layer.source
        });
        map.addLayer({
            'id': layer.id,
            'source': layer.id,
            'type': 'raster',
            'layout': {
                'visibility': 'none' // Initially hide the layer
            },
        });
    });

    // Adding the GeoJSON source and layer
    map.addSource('historic-geojson', {
        'type': 'vector',
        'url': 'mapbox://elhaqh.bgs4ssgs'
    });

    map.addLayer({
        'id': 'historic-layer',
        'type': 'fill',
        'source': 'historic-geojson',
        'source-layer': 'cleaned_21inch_OGS84-0hvyjb',
        'layout': {
            'visibility': 'none' // Layer is initially hidden
        },
        'paint': {
            'fill-color': '#b56a56', // Example fill color, change as necessary
            'fill-opacity': 0.5
        }
    });

    // Control Elements
    let currentLayerId = null;
    const layerText = document.getElementById('layerText'); // Get the layer text element

    // Slider Control for Raster Layers
    document.getElementById('layerSlider').addEventListener('input', function() {
        const value = parseInt(this.value, 10);
        hideAllLayers();

        if (value === 0) {
            layerText.textContent = '';
        } else {
            const selectedLayer = layers[value - 1];
            switchLayer(selectedLayer.id);
            layerText.textContent = selectedLayer.id;
        }
    });

    // Toggle Button Functionality for GeoJSON Layer
    document.getElementById('toggleGeoJSON').addEventListener('click', function() {
        const visibility = map.getLayoutProperty('historic-layer', 'visibility');
        if (visibility === 'visible') {
            map.setLayoutProperty('historic-layer', 'visibility', 'none');
            this.textContent = 'Show 2050 Flooding Projection';
        } else {
            map.setLayoutProperty('historic-layer', 'visibility', 'visible');
            this.textContent = 'Hide 2050 Flooding Projection';
        }
    });

    function switchLayer(newLayerId) {
        if (currentLayerId) {
            map.setLayoutProperty(currentLayerId, 'visibility', 'none');
        }
        map.setLayoutProperty(newLayerId, 'visibility', 'visible');
        map.setPaintProperty(newLayerId, 'raster-opacity', 0.8);
        currentLayerId = newLayerId;
    }

    function hideAllLayers() {
        layers.forEach(layer => {
            map.setLayoutProperty(layer.id, 'visibility', 'none');
        });
    }
});



// FOR HABIN'S PART
$(window).scroll(function() {
    // This scroll function now handles only the specific reclamation section
    $('.section').each(function() {
        let $section = $(this);
        let scroll = $(window).scrollTop() + ($(window).height() * 0.1);
        if ($section.position().top <= scroll && $section.position().top + $section.height() > scroll) {
            $('.section').removeClass('active');
            $section.addClass('active');
        } else {
            $section.removeClass('active');
        }
    });
});

// Separate interaction for the map not influenced by general scroll event
function updateInteractiveMapOnScroll() {
    let scrollPosition = $(window).scrollTop();
    // Add logic here if the interactive map's display or behavior needs to change on scroll
}

// Debounce the map update function to minimize performance impact
$(window).scroll(debounce(updateInteractiveMapOnScroll, 150));

// Debounce implementation
function debounce(func, delay) {
    let debounceTimer;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(context, args), delay);
    };
}



// FOR BAR CHART
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('imageSelector2').addEventListener('click', function(event) {
        console.log("Clicked element:", event.target);  // Log which element was clicked
        let target = event.target;
        // Ensure we get the LI element, considering nested elements
        while (target !== this && target.tagName.toLowerCase() !== 'li') {
            target = target.parentNode;
        }
        if (target.tagName.toLowerCase() === 'li') {
            const imagePath = target.getAttribute('data-image');
            console.log("Attempting to load image path:", imagePath);  // Log the image path to be loaded
            if (imagePath) {
                document.getElementById('selectedImage2').src = imagePath;
                console.log("Image path set successfully");
            } else {
                console.error("Image path not found");
            }
        }
    });
});

// FOR DANNY'S PART
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('imageSelector1').addEventListener('click', function(event) {
        console.log("Clicked element:", event.target);  // Log which element was clicked
        let target = event.target;
        // Ensure we get the LI element, considering nested elements
        while (target !== this && target.tagName.toLowerCase() !== 'li') {
            target = target.parentNode;
        }
        if (target.tagName.toLowerCase() === 'li') {
            const imagePath = target.getAttribute('data-image');
            console.log("Attempting to load image path:", imagePath);  // Log the image path to be loaded
            if (imagePath) {
                document.getElementById('selectedImage1').src = imagePath;
                console.log("Image path set successfully");
            } else {
                console.error("Image path not found");
            }
        }
    });
});

// FOR SLIDESHOW
let slideIndex = 1;
showSlides(slideIndex);

function plusSlides(n) {
  showSlides(slideIndex += n);
}

function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("slide");
  if (n > slides.length) {slideIndex = 1}
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
  }
  slides[slideIndex-1].style.display = "block";
}

// FOR DANNY'S PART
// $(window).scroll(function() {
//     let $window = $(window),
//         $body = $('body'),
//         $section = $('.section-danny');
//     let scroll = $window.scrollTop() + ($window.height() * 1 / 100); // Adjusted for activation point

//     $section.each(function() {
//         let $currentSection = $(this);
//         if ($currentSection.position().top <= scroll && $currentSection.position().top + $currentSection.height() > scroll) {
//             // Section is in the active area
//             if (!$currentSection.hasClass('active')) {
//                 $('.section-danny').removeClass('active'); // Remove 'active' from all sections
//                 $body.removeClass(function (index, css) {
//                     return (css.match (/(^|\s)color-\S+/g) || []).join(' ');
//                 });
//                 $currentSection.addClass('active'); // Add 'active' to this section
//             }
//         } else {
//             // Section is not in the active area
//             $currentSection.removeClass('active');
//         }
//     });
//   }).scroll();
