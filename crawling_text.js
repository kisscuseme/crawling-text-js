const axios = require("axios");
const cheerio = require("cheerio");
const fs = require('fs');

function delay(ms){
    return new Promise((resolve)=>{
        setTimeout(() => {
            resolve();
        }, ms);
    });
}

function main() {
    fs.readFile('sample2.txt','utf8',async function(err, data){
        var allText = data;
        var list = allText.split('\n');
        var urlList = [];
        for(var i=0; i<list.length;i++){
            var url = list[i].split('^')[4];
            if(typeof url != 'undefined'){
                let regex = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
                if(regex.test(url)){
                    urlList.push(url);
                }
            }
        }

        try {
            var resultList = [];
            for(var j=0;j<urlList.length;j++){
                console.log(j);
                var html = await axios.get(urlList[j]);
                var obj = {};
                const $ = cheerio.load(html.data);
                $("body").find(".tit_loc").map(function(i, e){
                    obj['loc'] = e.children[0].data.replace(/\n/g, " ").replace(/\r/g, " ").replace(/\t/g, " ").replace(/ +/g, " ").trim();

                    if(e.children[0].next != null){
                        obj['date'] = e.children[0].next.children[0].data.replace(/\n/g, " ").replace(/\r/g, " ").replace(/\t/g, " ").replace(/ +/g, " ").trim();
                    } else {
                        obj['date'] = "-";
                    }
                });
                obj['title'] = $("body").find(".search_tit").text().replace(/\n/g, " ").replace(/\r/g, " ").replace(/\t/g, " ").replace(/ +/g, " ").trim();
                obj['content_trans'] = $("body").find(".ins_view_pd").eq(0).find(".paragraph").text().replace(/\n/g, " ").replace(/\r/g, " ").replace(/\t/g, " ").replace(/ +/g, " ").trim();
                obj['content_origin'] = $("body").find(".ins_view_pd").eq(1).find(".paragraph").text().replace(/\n/g, " ").replace(/\r/g, " ").replace(/\t/g, " ").replace(/ +/g, " ").trim();
                resultList.push(obj);
                
                await delay(300);
            }

            var result = "";
            for(var i=0;i<resultList.length;i++){
                if(i == 0){
                    result = "위치"+"\t"+"날짜"+"\t"+"제목"+"\t"+"번역"+"\t"+"원문\r\n";
                }
                if(resultList[i].content_trans.length > 16000){
                    resultList[i].content_trans = resultList[i].content_trans.substr(0,16000);
                }
                result += resultList[i].loc+"\t"+resultList[i].date+"\t"+resultList[i].title+"\t"+resultList[i].content_trans+"\t"+resultList[i].content_origin+"\r\n";
            }

            fs.writeFile('result.txt', result, 'utf8', function(error){
                console.log('write end');
            });
        } catch(e) {
            console.log(e);
        }
    });
}

main();