// API URL
const url = "http://webprog1eabeadando.nhely.hu/elsofeladatresz/html/ajax.html";

// Az oldal betöltésekor elrejtjük a CRUD művelet szekciókat
window.onload = function() {
    // Inicializáláskor elrejtjük a CRUD művelet szekciókat
    document.getElementById("readDiv").style.display = "none";
    document.getElementById("createDiv").style.display = "none";
    document.getElementById("updateDiv").style.display = "none";
    document.getElementById("deleteDiv").style.display = "none";
    
    // Ellenőrizzük, hogy van-e mentett kód
    const savedCode = localStorage.getItem("ajaxCode");
    if (savedCode) {
        document.getElementById("codeInput").value = savedCode;
    }
};

// A felhasználói kód inicializálása és lekérdezés indítása
function initWithCode() {
    const codeInput = document.getElementById("codeInput").value.trim();
    
    // Ellenőrizzük, hogy a kód megfelelő formátumú-e
    if (codeInput.length < 8) { // Legalább 6 karakter Neptun + pár karakter egyedi azonosító
        document.getElementById("codeStatus").innerHTML = 
            "<p style='color:red'>Kérjük, adjon meg egy érvényes kódot! A kód formátuma: [Neptun kód][egyedi azonosító]</p>";
        return;
    }
    
    // Mentjük a kódot a localStorage-ba
    localStorage.setItem("ajaxCode", codeInput);
    
    // Státusz kiírása
    document.getElementById("codeStatus").innerHTML = 
        "<p style='color:green'>Kód beállítva: " + codeInput + "</p>";
    
    // Megjelenítjük a CRUD művelet szekciókat
    document.getElementById("readDiv").style.display = "block";
    document.getElementById("createDiv").style.display = "block";
    document.getElementById("updateDiv").style.display = "block";
    document.getElementById("deleteDiv").style.display = "block";
    
    // Adatok lekérdezése az új kóddal
    read();
}

// Aktuális kód lekérdezése a beviteli mezőből
function getCode() {
    return document.getElementById("codeInput").value.trim();
}

// Read művelet
async function read() {
    const code = getCode();
    
    if (!code) {
        document.getElementById("readDiv").innerHTML = "<p style='color:red'>Kérjük, először adja meg a kódját!</p>";
        return;
    }
    
    try {
        let response = await fetch(url, {
            method: 'post',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: "code=" + code + "&op=read"
        });
        
        let data = await response.text();
        data = JSON.parse(data);
        let list = data.list;
        
        // HTML táblázat készítése
        let str = "<h3>Read</h3>";
        str += "<p>Number of records: " + data.rowCount + "</p>";
        str += "<p>Last max " + data.maxNum + " records:</p>";
        
        str += "<table>";
        str += "<thead><tr><th>id</th><th>name</th><th>height</th><th>weight</th><th>code</th></tr></thead>";
        str += "<tbody>";
        
        // Adatok összegzése
        let heightSum = 0;
        let heightCount = 0;
        let heightMax = 0;
        
        for (let i = 0; i < list.length; i++) {
            str += "<tr>";
            str += "<td>" + list[i].id + "</td>";
            str += "<td>" + list[i].name + "</td>";
            str += "<td>" + list[i].height + "</td>";
            str += "<td>" + list[i].weight + "</td>";
            str += "<td>" + list[i].code + "</td>";
            str += "</tr>";
            
            // Height értékek feldolgozása
            if (list[i].height) {
                let height = parseFloat(list[i].height);
                if (!isNaN(height)) {
                    heightSum += height;
                    heightCount++;
                    if (height > heightMax) {
                        heightMax = height;
                    }
                }
            }
        }
        
        str += "</tbody></table>";
        
        // Height értékek statisztikája
        if (heightCount > 0) {
            str += "<p>Height összeg: " + heightSum.toFixed(2) + "</p>";
            str += "<p>Height átlag: " + (heightSum / heightCount).toFixed(2) + "</p>";
            str += "<p>Height legnagyobb: " + heightMax.toFixed(2) + "</p>";
        }
        
        document.getElementById("readDiv").innerHTML = str;
    } catch (error) {
        document.getElementById("readDiv").innerHTML = "<p style='color:red'>Hiba történt: " + error.message + "</p>";
    }
}

// Create művelet
async function create() {
    const code = getCode();
    
    if (!code) {
        document.getElementById("createResult").innerHTML = "<p style='color:red'>Kérjük, először adja meg a kódját!</p>";
        return;
    }
    
    // Adatok validálása
    let nameStr = document.getElementById("name1").value;
    let height = document.getElementById("height1").value;
    let weight = document.getElementById("weight1").value;
    
    if (nameStr.length > 0 && nameStr.length <= 30 && 
        height.length > 0 && height.length <= 30 && 
        weight.length > 0 && weight.length <= 30) {
        
        try {
            let response = await fetch(url, {
                method: 'post',
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: "code=" + code + "&op=create&name=" + encodeURIComponent(nameStr) + 
                      "&height=" + encodeURIComponent(height) + 
                      "&weight=" + encodeURIComponent(weight)
            });
            
            let data = await response.text();
            
            if (data > 0) {
                document.getElementById("createResult").innerHTML = "<p style='color:green'>Create successful!</p>";
            } else {
                document.getElementById("createResult").innerHTML = "<p style='color:red'>Create NOT successful!</p>";
            }
            
            // Mezők ürítése
            document.getElementById("name1").value = "";
            document.getElementById("height1").value = "";
            document.getElementById("weight1").value = "";
            
            // Frissítjük a táblázatot
            read();
        } catch (error) {
            document.getElementById("createResult").innerHTML = "<p style='color:red'>Hiba történt: " + error.message + "</p>";
        }
    } else {
        document.getElementById("createResult").innerHTML = "<p style='color:red'>Validation error! All fields are required and max 30 characters.</p>";
    }
}

// Get Data for ID
async function getDataForId() {
    const code = getCode();
    
    if (!code) {
        document.getElementById("updateResult").innerHTML = "<p style='color:red'>Kérjük, először adja meg a kódját!</p>";
        return;
    }
    
    let id = document.getElementById("idUpd").value;
    
    if (id.trim() === "") {
        document.getElementById("updateResult").innerHTML = "<p style='color:red'>Please enter an ID</p>";
        return;
    }
    
    try {
        let response = await fetch(url, {
            method: 'post',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: "code=" + code + "&op=read"
        });
        
        let data = await response.text();
        data = JSON.parse(data);
        let list = data.list;
        let found = false;
        
        for (let i = 0; i < list.length; i++) {
            if (list[i].id == id) {
                document.getElementById("name2").value = list[i].name;
                document.getElementById("height2").value = list[i].height;
                document.getElementById("weight2").value = list[i].weight;
                found = true;
                break;
            }
        }
        
        if (!found) {
            document.getElementById("updateResult").innerHTML = "<p style='color:red'>No record found with ID: " + id + "</p>";
        } else {
            document.getElementById("updateResult").innerHTML = "<p style='color:green'>Record loaded successfully</p>";
        }
    } catch (error) {
        document.getElementById("updateResult").innerHTML = "<p style='color:red'>Hiba történt: " + error.message + "</p>";
    }
}

// Update művelet
async function update() {
    const code = getCode();
    
    if (!code) {
        document.getElementById("updateResult").innerHTML = "<p style='color:red'>Kérjük, először adja meg a kódját!</p>";
        return;
    }
    
    // Adatok validálása
    let id = document.getElementById("idUpd").value;
    let nameStr = document.getElementById("name2").value;
    let height = document.getElementById("height2").value;
    let weight = document.getElementById("weight2").value;
    
    if (id.length > 0 && 
        nameStr.length > 0 && nameStr.length <= 30 && 
        height.length > 0 && height.length <= 30 && 
        weight.length > 0 && weight.length <= 30) {
        
        try {
            let response = await fetch(url, {
                method: 'post',
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: "code=" + code + "&op=update&id=" + id + 
                      "&name=" + encodeURIComponent(nameStr) + 
                      "&height=" + encodeURIComponent(height) + 
                      "&weight=" + encodeURIComponent(weight)
            });
            
            let data = await response.text();
            
            if (data > 0) {
                document.getElementById("updateResult").innerHTML = "<p style='color:green'>Update successful!</p>";
            } else {
                document.getElementById("updateResult").innerHTML = "<p style='color:red'>Update NOT successful!</p>";
            }
            
            // Mezők ürítése
            document.getElementById("idUpd").value = "";
            document.getElementById("name2").value = "";
            document.getElementById("height2").value = "";
            document.getElementById("weight2").value = "";
            
            // Frissítjük a táblázatot
            read();
        } catch (error) {
            document.getElementById("updateResult").innerHTML = "<p style='color:red'>Hiba történt: " + error.message + "</p>";
        }
    } else {
        document.getElementById("updateResult").innerHTML = "<p style='color:red'>Validation error! All fields are required and max 30 characters.</p>";
    }
}

// Delete művelet
async function deleteF() {
    const code = getCode();
    
    if (!code) {
        document.getElementById("deleteResult").innerHTML = "<p style='color:red'>Kérjük, először adja meg a kódját!</p>";
        return;
    }
    
    let id = document.getElementById("idDel").value;
    
    if (id.length > 0) {
        try {
            let response = await fetch(url, {
                method: 'post',
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: "code=" + code + "&op=delete&id=" + id
            });
            
            let data = await response.text();
            
            if (data > 0) {
                document.getElementById("deleteResult").innerHTML = "<p style='color:green'>Delete successful!</p>";
            } else {
                document.getElementById("deleteResult").innerHTML = "<p style='color:red'>Delete NOT successful!</p>";
            }
            
            // Mező ürítése
            document.getElementById("idDel").value = "";
            
            // Frissítjük a táblázatot
            read();
        } catch (error) {
            document.getElementById("deleteResult").innerHTML = "<p style='color:red'>Hiba történt: " + error.message + "</p>";
        }
    } else {
        document.getElementById("deleteResult").innerHTML = "<p style='color:red'>Validation error! ID is required.</p>";
    }
}
