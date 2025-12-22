
const iconData = [
	{ icon: "💃🏻", message: "I spend a lot of my free time dancing! Take a look at some of my dancing here (hint I am in the white dress):", button: true, link: "https://www.youtube.com/watch?v=126sOanaJdo&list=PLa2VpjRuWOYsTJEXwrTMBnOu7-5q3-S-O&index=51" },      
	{ icon: "👋", message: "Welcome to my portfolio! Hope you enjoy!", button: false, link: "" },             
	{ icon: "🏺︎", message: "One of my hobbies is ceramics! Take a look at some of my creations here:", button: false, link: "https://your-wix-site.com/gravity" },      
	{ icon: "🧵︎", message: "Are you a fan of embroidery? I am!", button: false, link: "" },           
	{ icon: "🦀︎", message: "Currently residing in Boston. Lots of seafood around here...", button: false, link: "" },      
	{ icon: "🏙︎", message: "Fun fact: I'm from Toronto!", button: false, link: "" },      
	{ icon: "✏︎", message: "I'm an avid urban sketcher and keep a sketchbook with me all the time! Take a look at my sketches!", button: false, link: "" },      
	{ icon: "🍁︎", message: "Just a falling leaf. Nothing to see here.", button: false, link: "" },           
	{ icon: "💧︎", message: "Oh no! I guess its drizzling on this webpage at the moment. Hope you brought some rainboots!", button: false, link: "" },      
	{ icon: "❄︎", message: "*gasp* Winter is here!", button: false, link: "" }   
  ];
  

	  
		const activeIcons = new Set();
	  
		function spawnIcon(iconObj) {
		  if (activeIcons.has(iconObj.icon)) {
			// This icon is already falling, skip spawning another
			return;
		  }
	  
		  activeIcons.add(iconObj.icon);
	  
		  const icon = document.createElement('div');
		  icon.className = 'falling-icon';
		  icon.textContent = iconObj.icon;
	  
		  // Random horizontal position (0 - 90 vw to avoid overflow)
		  icon.style.left = `${Math.random() * 90}vw`;
	  
		  // Random fall duration between 8 and 15 seconds
		  const fallDuration = 8 + Math.random() * 7;
		  icon.style.animation = `fall-wobble ${fallDuration}s linear forwards`;
	  
		  // Append icon to body
		  document.body.appendChild(icon);
	  
		  // When animation ends, remove icon and mark it inactive
		  icon.addEventListener('animationend', () => {
			if (icon.parentNode) {
			  icon.parentNode.removeChild(icon);
			}
			activeIcons.delete(iconObj.icon);
		  });
	  
		  // Show popup on click
		  icon.addEventListener('click', (e) => {
			e.stopPropagation();
			icon.style.animationPlayState = 'paused';
	  
			// Create popup
			const popup = document.createElement('div');
			popup.className = 'popup';
			popup.innerHTML = `
			  <div class="popup-content">
				<p>${iconObj.message}</p>
				<button class="close-btn">X</button>
			  </div>
			`;
	  
			document.body.appendChild(popup);
	  
			const iconRect = icon.getBoundingClientRect();
			const popupRect = popup.getBoundingClientRect();
	  
			// Position popup to the right if fits, else to the left
			let leftPos = iconRect.right + 10;
			if (leftPos + popupRect.width > window.innerWidth) {
			  leftPos = iconRect.left - popupRect.width - 10;
			}
	  
			// Vertically align with icon top, adjust if overflow bottom
			let topPos = iconRect.top;
			if (topPos + popupRect.height > window.innerHeight) {
			  topPos = window.innerHeight - popupRect.height - 10;
			}
	  
			popup.style.left = `${leftPos}px`;
			popup.style.top = `${topPos}px`;
	  
			// Close popup and resume animation on button click
			popup.querySelector('.close-btn').addEventListener('click', () => {
			  icon.style.animationPlayState = 'running';
			  if (popup.parentNode) popup.parentNode.removeChild(popup);
			});
		  });
		}
	  
		// Drop a new icon every 1.5 seconds, max 3 icons on screen
		setInterval(() => {
		  const currentIconsCount = document.querySelectorAll('.falling-icon').length;
		  if (currentIconsCount >= 3) return;
	  
		  // Choose a random icon from iconData
		  const randomIcon = iconData[Math.floor(Math.random() * iconData.length)];
		  spawnIcon(randomIcon);
		}, 1500);