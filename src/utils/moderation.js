
const forbiddenWords = [ "badirchand","bakland","bhadva",
"bhootnika","chinaal","chup","chutia","ghasti","chutiya","haraami","haraam","hijra","hinjda","jaanvar","kutta","kutiya","khota","auladheen",
"jaat","najayaz","gandpaidaish","saala","kutti","soover","tatti","potty","bahenchod","bahanchod","bahencho","bancho","bahenke",
"laude","takke","betichod","bhaichod","bhains","jhalla","jhant",
"nabaal","pissu","kutte","maadherchod","madarchod","padma","raand","jamai","randwa","randi","bachachod","bachichod","bachchechod",
"booblay","buble","babla","bhonsriwala","bhonsdiwala","ched","chut","chod","chodu",
"chodra","choochi","chuchi","gaandu","gandu","gaand","lavda","lawda","lauda","lund","balchod",
"lavander","muth","maacho","mammey","tatte","toto","toota","backar","bhandwe","bhosadchod","bhosad","bumchod","bum","bur","chatani","cunt",
"cuntmama","chipkali","pasine","jhaat","chodela","bhagatchod","chhola","chudai","chudaikhana","chunni",
"choot","bhoot","dhakkan","bhajiye","fateychu","gandnatije","lundtopi",
"gaandu","gaandfat","gaandmasti","makhanchudai","gaandmarau","gandu","chaatu","beej","choosu","fakeerchod","lundoos",
"shorba","binbheja","bhadwe","parichod","nirodh","pucchi","baajer","choud","bhosda",
"sadi","choos","maka","chinaal","gadde","joon","chodela","bhagatchod","chhola","chudai","chudaikhana","chunni","choot",
"bhoot","dhakkan","bhajiye","fateychu","gandnatije","lundtopi","gaandu","gaandfat","gaandmasti","makhanchudai","gaandmarau","gandu",
"chaatu","beej","choosu","fakeerchod","lundoos","shorba","binbheja","bhadwe","parichod","nirodh","pucchi","baajer","choud",
"bhosda","sadi","choos","maka","chinaal","gadde","joon","chullugand","doob","khatmal","gandkate","bambu","lassan",
"danda","keera","keeda","hazaarchu","paidaishikeeda","kali","safaid","poot","behendi","chus","machudi","chodoonga",
"baapchu","laltern","suhaagchudai","raatchuda","kaalu","neech","chikna","meetha","beechka","chooche","patichod","rundi","makkhi",
"biwichod","chodhunga","haathi","kute","jhanten","kaat","gandi","chut","chutad","chutia","chutiya",
"raandsaala","phudi","chute","kussi","khandanchod","ghussa","maarey","chipkili",
"unday","budh","chaarpai","chodun","chatri","chode","chodho","mulle","mulla","mullekatue","mullikatui",
"mullekebaal","momedankatue","katua","chutiye","lavde","chutiyapa","chudwaya","kutton","jungli","vahiyaat","jihadi",
"atankvadi","atankwadi","aatanki","bc","mc","chudwaya","kutton","jungli","jihadi","atankvadi","atankwadi","aatanki"
];


function containsForbiddenWord(content) {

    if (typeof content !== 'string') {
        throw new Error('Content must be a string.');
    }

    return forbiddenWords.some(word => content.toLowerCase().includes(word.toLowerCase()));
}

export { containsForbiddenWord };
