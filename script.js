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

    //create min and max variables and use the numbers gathered from the fetch
    min = json.min
    max = json.max
    middle = Math.floor((min+max)/2)

    return json
}

async function getEntryAt(index) {
    //fetch specific word
    const entry = await fetch(`${endpoint}${index}`).then(resp => resp.json())
    
    return entry
}
    
async function compare(searchterm, entry) {
    //Normalize and toLowerCase so that your example with co2 and CO₂ will work
    searchterm = searchterm.toLowerCase().normalize('NFKC')
    entryNorm = entry.inflected.toLowerCase().normalize('NFKC')
    const comp = searchterm.localeCompare(entryNorm)
    
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

async function runSearch() {
    event.preventDefault()

    //Reset the min, max, and middle values
    await getSizes()

    //Start the timer
    performance.mark("start")

    correctWord = false;
    
    //Get the searchterm from the html user
    searchterm = document.getElementById("searchterm").value

    //Count amount of server requests with i
    i = 1
    
    //Loop while searching
    while(!correctWord && min<=max) {
        //Get the new entry every time
        entry = await getEntryAt(middle)
        compare(searchterm, entry)
        
        //stop the timer
        performance.mark("end")

        //Measure the requests and show amount of time
        const requestMeasure = performance.measure("duration", "start", "end")
        document.getElementById("serverReqs").innerHTML = "Server requests: " + i + " - Tid: " + requestMeasure.duration + " ms"

        i++

        //Middle adjusted
        middle = Math.floor((min+max)/2)

        if(correctWord) {
            //Make all the paragraphs visible
            document.getElementById("hide").classList.remove("hide")
            document.getElementById("foundOrNot").innerHTML="FOUND"
            document.getElementById("inflected").innerHTML="Bøjningsform: " + entry.inflected
            document.getElementById("headword").innerHTML="Opslagsord: " + entry.headword
            document.getElementById("homograph").innerHTML="Homograf nr. "
            document.getElementById("partOfSpeech").innerHTML="Ordklasse: " + entry.partofspeech
            document.getElementById("wordID").innerHTML="id: " + entry.id

        } else if(i >= 20) {
            //Hide paragraphs from previously found word
            document.getElementById("hide").classList.add("hide")
            document.getElementById("foundOrNot").innerHTML="NOT FOUND"
        } 
    } 
}