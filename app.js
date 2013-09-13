(function() {
/**
 * CONTACT EXPORTER
 * Author: andre@andregarzia.com
 * 
 * A sample app for Firefox OS that exports all your contacts to a vCard file on the SD Card.
 *
 * Uses 
 * - Contacts API https://developer.mozilla.org/en-US/docs/WebAPI/Contacts
 * - Device Storage API https://developer.mozilla.org/en-US/docs/WebAPI/Device_Storage
 *	
 * It also uses jQuery Mobile for building the user interface.
 *
 * A minimal mozContact to vCard library is included in vcard.js
 */

	
var allContactsCursor,
	contactListContainer = document.getElementById("list"),
	selectedContacts = [];


function logContactData(inContact) {
	console.log(inContact.name);
	console.dir(inContact);
}



function appendContact(inContact) {
		
	var listItem = document.createElement("li"),
		paragraph = document.createElement("p"),
		paragraphContent = document.createTextNode(inContact.name);
	
	console.log("Appending contact to the list:" + inContact.name);
	
	var teste = "<li><p>" + inContact.name + "</p></li>";
	
	selectedContacts.push(inContact);
	
	contactListContainer.insertAdjacentHTML("beforeend",teste);
}

function selectedContactsToVcard() {
	var vCard = "",
	i = 0,
	len = 0;
	for(i = 0, len = selectedContacts.length; i < len; i++) {
		vCard += contactToVcard(selectedContacts[i]);
		vCard += "\r\n";
		
	}
	
	return vCard;
}

function removeContactsFileFromSDCard(inCallback) {
	var sdcard = navigator.getDeviceStorage('sdcard'),
	    request = sdcard.delete("contacts.vcf");

	request.onsuccess = function () {
		console.log("file deleted");
		inCallback();
	}

	// An error typically occur if a file with the same name already exist
	request.onerror = function () {
	  console.warn('Unable to delete the file: ' + this.error.name);
	  inCallback();
	}
}

function saveVcardToSDCard(vCard) {
	var sdcard = navigator.getDeviceStorage('sdcard'),
		file   = new Blob([vCard], {type: "text/vcard"}),
	    request = sdcard.addNamed(file,   "contacts.vcf");

	request.onsuccess = function () {
	  var name = this.result;
	  console.log('File "' + name + '" successfully wrote on the sdcard storage area');
	  alert("Contacts saved to SD Card");
	}

	// An error typically occur if a file with the same name already exist
	request.onerror = function () {
	  console.warn('Unable to write the file: ' + this.error.name);
	  alert("Could not save contacts: " + this.error.name);
	}
}

function saveSelectedContactsToFile() {
	var vCard = selectedContactsToVcard();
	
	console.log(vCard);
	
	removeContactsFileFromSDCard(function () {saveVcardToSDCard(vCard)});
}





$( document ).on( 'pageinit', function(event){
	  console.log("loading");
	  allContactsCursor = navigator.mozContacts.getAll({sortBy: "name", sortOrder   : "ascending"});
  
	  allContactsCursor.onsuccess = function() {
	      if(allContactsCursor.result) {
	  		var contact = allContactsCursor.result;
	  		console.log("new result:" + contact.name);
	  		appendContact(contact);
	        allContactsCursor.continue();
	      }
	  
	  };

	  allContactsCursor.onerror = function() {
	      alert("Error getting contacts");
	  };
  
  
	  document.getElementById("save-to-sdcard").addEventListener("click", saveSelectedContactsToFile);
});

}());

