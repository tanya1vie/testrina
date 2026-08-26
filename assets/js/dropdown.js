 // Dropdown functionality
 const sortButton = document.querySelector('.sort-button');
 const dropdownContent = document.querySelector('.dropdown-content');
 
 sortButton.addEventListener('click', () => {
     dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
 });

 // Sorting functionality
 const filterButtons = document.querySelectorAll('.dropdown-content a');
 const projects = document.querySelectorAll('.project-card');

 filterButtons.forEach(button => {
button.addEventListener('click', (e) => {
 e.preventDefault();
 const category = button.getAttribute('data-category');
 filterProjects(category);
 dropdownContent.style.display = 'none';
});
});


 // Close dropdown when clicking outside
 window.addEventListener('click', (e) => {
     if (!e.target.matches('.sort-button')) {
         dropdownContent.style.display = 'none';
     }
 });

 function filterProjects(category) {
const cards = document.querySelectorAll('.project-card');

cards.forEach(card => {
 const categories = card.getAttribute('data-category').split(',').map(c => c.trim());

 if (category === 'all' || categories.includes(category)) {
     card.style.display = 'block';
 } else {
     card.style.display = 'none';
 }
});
}