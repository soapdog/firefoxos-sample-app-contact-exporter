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


    /**
     * Picks a mozContact and adds it to the main listview on the screen. It also adds the contact
     * to the selectedContacts array that is used to export the contacts if the user press the Save To SD Card
     * button.
     * @param inContact
     */
    function appendContact(inContact) {
        console.log("Appending contact to the list:" + inContact.name);

        var teste = "<li><p>" + inContact.name + "</p></li>";

        selectedContacts.push(inContact);

        contactListContainer.insertAdjacentHTML("beforeend",teste);
    }

    /**
     * Loops the selectedContacts array (a.k.a. all contacts) picking each contact and converting it to a vCard.
     * all the vCards are concatenated and returned as a single vCard string.
     * @returns {string} - vCard of all contacts
     */
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

    /**
     * Unfortunately we can't overwrite files so we need to delete contacts.vcf before writing to it again. This
     * function tries to remove the file and then calls a callback. This callback is the saving function, so this is
     * a delete file then save the file again operation.
     * @param inCallback
     */
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

    /**
     * Picks a vCard string and save it to a file in the SD Card called contacts.vcf
     * @param vCard
     */
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

    /**
     * Converts the selectedContacts into a vCard then executes the delete file then save file procedure to store it
     * on the SD Card as contacts.vcf
     */
    function saveSelectedContactsToFile() {
        var vCard = selectedContactsToVcard();

        console.log(vCard);

        removeContactsFileFromSDCard(function () {saveVcardToSDCard(vCard)});
    }


    /**
     * This is our initialization function, like an onload function but provided by jQuery Mobile. This will fire
     * after everything load and the page is assembled.
     *
     * It will initialize the mozContacts cursor by executing a getAll() call.
     *
     * It will also bind the Save To SD Card button to the correct function.
     */
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

