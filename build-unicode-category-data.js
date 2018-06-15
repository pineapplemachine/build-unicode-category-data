const fs = require("fs");

// From https://www.unicode.org/reports/tr44/#General_Category_Values
const namedCategories = [
    {
        short: "Lu",
        full: "Uppercase_Letter",
    },
    {
        short: "Ll",
        full: "Lowercase_Letter",
    },
    {
        short: "Lt",
        full: "Titlecase_Letter",
    },
    {
        short: "Lm",
        full: "Modifier_Letter",
    },
    {
        short: "Lo",
        full: "Other_Letter",
    },
    {
        short: "Mn",
        full: "Nonspacing_Mark",
    },
    {
        short: "Mc",
        full: "Spacing_Mark",
    },
    {
        short: "Me",
        full: "Enclosing_Mark",
    },
    {
        short: "Nd",
        full: "Decimal_Number",
    },
    {
        short: "Nl",
        full: "Letter_Number",
    },
    {
        short: "No",
        full: "Other_Number",
    },
    {
        short: "Pc",
        full: "Connector_Punctuation",
    },
    {
        short: "Pd",
        full: "Dash_Punctuation",
    },
    {
        short: "Ps",
        full: "Open_Punctuation",
    },
    {
        short: "Pe",
        full: "Close_Punctuation",
    },
    {
        short: "Pi",
        full: "Initial_Punctuation",
    },
    {
        short: "Pf",
        full: "Final_Punctuation",
    },
    {
        short: "Po",
        full: "Other_Punctuation",
    },
    {
        short: "Sm",
        full: "Math_Symbol",
    },
    {
        short: "Sc",
        full: "Currency_Symbol",
    },
    {
        short: "Sk",
        full: "Modifier_Symbol",
    },
    {
        short: "So",
        full: "Other_Symbol",
    },
    {
        short: "Zs",
        full: "Space_Separator",
    },
    {
        short: "Zl",
        full: "Line_Separator",
    },
    {
        short: "Zp",
        full: "Paragraph_Separator",
    },
    {
        short: "Cc",
        full: "Control",
    },
    {
        short: "Cf",
        full: "Format",
    },
    {
        short: "Cs",
        full: "Surrogate",
    },
    {
        short: "Co",
        full: "Private_Use",
    },
    {
        short: "Cn",
        full: "Unassigned",
    },
];
const derivedCategories = [
    {
        short: "LC",
        full: "Cased_Letter",
        includes: ["Lu", "Ll", "Lt"],
    },
    {
        short: "L",
        full: "Letter",
        includes: ["Lu", "Ll", "Lt", "Lm", "Lo"],
    },
    {
        short: "M",
        full: "Mark",
        includes: ["Mn", "Mc", "Me"],
    },
    {
        short: "N",
        full: "Number",
        includes: ["Nd", "Nl", "No"],
    },
    {
        short: "P",
        full: "Punctuation",
        includes: ["Pc", "Pd", "Ps", "Pe", "Pi", "Pf", "Po"],
    },
    {
        short: "S",
        full: "Symbol",
        includes: ["Sm", "Sc", "Sk", "So"],
    },
    {
        short: "Z",
        full: "Separator",
        includes: ["Zs", "Zl", "Zp"],
    },
    {
        short: "C",
        full: "Other",
        includes: ["Cc", "Cf", "Cs", "Co", "Cn"],
    },
];

// Populated by the script
const characterCategories = {};

for(let category of namedCategories){
    characterCategories[category.short] = {
        shortName: category.short,
        fullName: category.full,
        fullCharacterList: [],
        singleCharacters: [],
        characterRanges: [],
        derivedFrom: null,
    };
}

for(let category of derivedCategories){
    characterCategories[category.short] = {
        shortName: category.short,
        fullName: category.full,
        fullCharacterList: [],
        singleCharacters: [],
        characterRanges: [],
        derivedFrom: category.includes,
    };
}

// Add a single character
function addCharacter(codePoint, category, derivedOk){
    const cat = characterCategories[category];
    if(cat.derivedFrom && !derivedOk){
        throw new Error("Invalid category: " + category);
    }
    const singles = cat.singleCharacters;
    const ranges = cat.characterRanges;
    cat.fullCharacterList.push(codePoint);
    if(ranges.length && ranges[ranges.length - 1][1] === codePoint - 1){
        ranges[ranges.length - 1][1] = codePoint;
    }else if(singles.length && singles[singles.length - 1] === codePoint - 1){
        ranges.push([singles.pop(), codePoint]);
    }else{
        singles.push(codePoint);
    }
}

// Parse the full data file
function parseUnicodeData(data){
    let parts = [""];
    let lineNumber = 1;
    for(let i = 0; i < data.length; i++){
        const ch = data[i];
        if(ch === ";" && parts.length < 3){
            parts.push("");
        }else if(ch === ";"){
            const codePoint = parseInt(parts[0], 16);
            const category = parts[2];
            addCharacter(codePoint, category, false);
            while(i < data.length && data[i] !== "\n") i++;
            parts = [""];
            lineNumber++;
            if(lineNumber % 5000 === 0){
                console.log("On line " + lineNumber + " of about 32,000...");
            }
        }else{
            parts[parts.length - 1] += ch;
        }
    }
}

function addDerivedCategories(){
    for(let derived of derivedCategories){
        const fullCharacterList = [];
        for(let included of derived.includes){
            const categoryObject = characterCategories[included];
            if(!categoryObject || categoryObject.includes){
                throw new Error("Invalid category: " + included);
            }
            fullCharacterList.push(
                ...categoryObject.fullCharacterList
            );
        }
        fullCharacterList.sort((a, b) => {
            if(a < b) return -1;
            else if(a > b) return +1;
            else return 0;
        });
        fullCharacterList.forEach(
            ch => addCharacter(ch, derived.short, true)
        );
    }
}

function getCategoryList(){
    const list = [];
    for(let key in characterCategories){
        list.push(characterCategories[key]);
    }
    return list;
}

// Read https://www.unicode.org/Public/UCD/latest/ucd/UnicodeData.txt
console.log("Reading txt data file.");
const data = fs.readFileSync("UnicodeData.txt", "utf-8").toString();

// Parse it
console.log("Parsing txt data file.");
parseUnicodeData(data);

// Add derived categores
console.log("Adding derived categories.");
addDerivedCategories();

// Output json
console.log("Writing json data file.");
fs.writeFileSync("unicode-data.json", JSON.stringify(getCategoryList()));

console.log("All done!");
