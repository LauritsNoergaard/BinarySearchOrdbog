window.addEventListener("load", start)
endpoint = "http://localhost:8080/ordbogen/"
min = 0
max = 0
middle = 0
correctWord = false


function start() {
    console.log("Javascript is running")
    getSizes()
    document.querySelector("#searchForm").addEventListener("submit", runSearch)
}

async function getSizes() {
    //fetch min and max values
    const json = await fetch(endpoint).then((Response) => Response.json())
    //log to test it works
    //console.log(json)
    //create min and max variables and use the numbers gathered from the fetch
    min = json.min
    max = json.max
    middle = Math.floor((min+max)/2)
    //log to test it works
    //console.log(middle)

    return json
}

async function getEntryAt(index) {
    //fetch specific word
    const entry = await fetch(`${endpoint}${index}`).then(resp => resp.json())
    //log to test it works
    //console.log(entry)
    return entry
}
    
async function compare(searchterm, entry) {
    console.log(searchterm + " " + entry.inflected)
    searchterm = searchterm.toLowerCase().normalize('NFKC')
    entryTEST = entry.inflected.toLowerCase().normalize('NFKC')
    console.log(searchterm + " " + entryTEST)
    const comp = searchterm.localeCompare(entryTEST)
    console.log("Inside compare function comp == " + comp)
    
    if(comp==0) {
        //This is the correct inflection
        correctWord = true
        return entry //Since middle here is adjusted to be the correct index
    } else if(comp<0) {
        max = middle -1
    } else {
        min = middle + 1
    }
    
}

async function runSearch() { //This is the function where we have our loop 
    event.preventDefault()
    //Reset the min, max, and middle values
    await getSizes()

    //Start the timer
    performance.mark("start")

    correctWord = false;
    
    //Get the searchterm from the html user
    searchterm = document.getElementById("searchterm").value
    //console.log(searchterm)

    //Fetch the middle word and compare
    //New middle has been made, so fetch the next middle word and compare HERE?
    i = 1
    
    while(!correctWord && min<=max) {
        //console.log("min = " + min + " max = " + max + " middle = " + middle)

        //Get the new entry every time
        entry = await getEntryAt(middle)
        console.log(entry)
        compare(searchterm, entry)
        
        //Count iterations and print
        //stop the timer
        performance.mark("end")
        const requestMeasure = performance.measure("duration", "start", "end")
        //console.log("Tid: " + requestMeasure.duration + "ms")
        document.getElementById("serverReqs").innerHTML = "Server requests: " + i + " - Tid: " + requestMeasure.duration + " ms"
        i++

        //Middle adjusted
        middle = Math.floor((min+max)/2)

        if(correctWord) {
            document.getElementById("hide").classList.remove("hide")
            document.getElementById("foundOrNot").innerHTML="FOUND"
            document.getElementById("inflected").innerHTML="Bøjningsform: " + entry.inflected
            document.getElementById("headword").innerHTML="Opslagsord: " + entry.headword
            document.getElementById("homograph").innerHTML="Homograf nr. "
            document.getElementById("partOfSpeech").innerHTML="Ordklasse: " + entry.partofspeech
            document.getElementById("wordID").innerHTML="id: " + entry.id

        } else if(i >= 20) { //todo IF THE WORD ISN'T FOUND, PRINT "NOT FOUND"
            document.getElementById("hide").classList.add("hide")
            document.getElementById("foundOrNot").innerHTML="NOT FOUND"
        } 
    
    } 
    
}