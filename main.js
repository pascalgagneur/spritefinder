(function($){
    if( $() instanceof jQuery ){
        /*
         *
         * Function for parsing out and returning css values for height, width, top and left.
         *
         * @param value
         *           a string to be parsed.
         * @param multi
         *           a multiplyer to invert position.
         * @return a valid css string or error (undefined,null)
         *
         */
        function calculatePosition(value,multi){
            if(multi === undefined){
                multi = 1;
            }
            if(value.indexOf("px") > 0){
                return parseInt(value,10)*multi +"px"; //Reverting value for position.
            } else if( value.indexOf("%") > 0){
                return value;
            } else if(value.length === 0){
                return 50+"px";
            } else {
                console.log("This is a strange value:"+value);
            }
            return null;
        }
        /*
         *
         * Function for loading the style and parsing out all background images.
         *
         * @param event
         *           the click event that trigger the function.
         */
        function loadCSSImages(event){
            event.preventDefault();
            var id = $(this).data("CSSStyleSheet"),
                images = {},
                errorCount = 0;
            warningCount = 0;
            styleSheet = window.document.styleSheets.item(id),
                rules = styleSheet.cssRules || styleSheet.rules;
            if( rules !== null){
            console.log("Found "+rules.length+" css rules.");
            console.log("Start looking for images...");
            for(var i = 0; i < rules.length;i++){
                var imgName ="",
                    imgUrl = "",
                    tmp,
                    bgImg,
                    thisRule = rules[i];
                if( thisRule.type === 1 ) {
                    bgImg = thisRule.style.backgroundImage;
                    if(bgImg !== "" && bgImg.indexOf("url") === 0 && bgImg.indexOf("url(data") !== 0 ){

                        imgUrl = bgImg.substring(4,bgImg.length-1);
                        tmp = imgUrl.split("/");
                        imgName=tmp[tmp.length-1];
                        if(images[imgName] === undefined){
                            images[imgName] = {"name":imgName,"url":imgUrl,"count":1,"rules":[thisRule]}
                        } else {
                            images[imgName].count = images[imgName].count+1;
                            images[imgName].rules.push(thisRule);
                        }
                    }
                }
            }
            for (var k in images) {
                if(images[k].count > 2){
                    var imgCon = $("<div/>")
                            .css({'position':'relative'})
                            .addClass("imgCon")
                            .attr("id",images[k].name),
                        sprite = $("<img/>").attr("src",images[k].url),
                        thisImage = images[k];
                    imgCon.append(sprite);
                    imgCon.addClass("imgCon");
                    console.log(thisImage.name + " is used more then three times and is probobly a sprite. Used "+thisImage.count+ " times in the css.");
                    for(var r in thisImage.rules){
                        var usedPart = $("<div/>"),
                            cssJSON = {},
                            thisRuleStyle = thisImage.rules[r].style,
                            thisSelectorText = thisImage.rules[r].selectorText;
                        cssJSON.position = "absolute";
                        cssJSON.backgroundColor = "rgba(255,0,0,0.25)";
                        cssJSON.top = calculatePosition(thisRuleStyle.backgroundPositionY,-1);
                        cssJSON.left = calculatePosition(thisRuleStyle.backgroundPositionX,-1);
                        cssJSON.height = calculatePosition(thisRuleStyle.height);
                        cssJSON.width = calculatePosition(thisRuleStyle.width);
                        if( cssJSON.top === null || cssJSON.left === null){
                            console.log("Placeholder is out of bounce...");
                            console.log(thisImage.rules[r]);
                            errorCount++;
                        } if(cssJSON.height === undefined || cssJSON.width === undefined){
                            console.log("Missing with or height for css rule \""+thisSelectorText+"\"");
                            errorCount++;
                        } if(cssJSON.height === null || cssJSON.width === null){
                            cssJSON.backgroundColor = "rgba(255,255,0,0.25)";
                            cssJSON.height = thisRuleStyle.height;
                            cssJSON.width = thisRuleStyle.width;
                            console.warn("With or height is set in EM for css rule \""+thisSelectorText+"\". Placeholder is then green.");
                            imgCon.append( usedPart.css(cssJSON)
                                .attr("title",thisSelectorText)
                            );
                            warningCount++;
                        } else {
                            imgCon.append( usedPart.css(cssJSON)
                                .attr("title",thisSelectorText)
                            );
                        }
                    }
                    spriteFinderCon.append(imgCon);
                    imgCon.click(function(){
                        var elm = $(this),
                            img = elm.children("img");
                        if(elm.hasClass("show")){
                            elm.removeClass("show");
                            elm.width(150).height(150);
                        } else {
                            var width,
                                height,
                                tmpImg = new Image();
                            tmpImg.src = img.attr("src");
                            elm.addClass("show");
                            elm.width(tmpImg.width).height(tmpImg.height);
                        }
                    });
                }
            }
            if(warningCount > 0 || errorCount > 0){
                alert("We have " + warningCount + " warnings and " + errorCount + "errors. More info in the console.");
            }
            } else {
                console.log("The CSSStyleSheet has no rules! HREF:"+styleSheet.href);
            }
        }

        if(window.document.styleSheets.length){
            var spriteFinderCon = $("<div/>").attr("id","spriteFinderCon").css({"position":"absolute"});
            $("body").append(spriteFinderCon);
            spriteFinderCon.append('<div id="spriteFinderCssListCon">'+
                '<h2>CSS sprite finder</h2>'+
                '<h3>Click on css to load images</h3>'+
                '<ul id="spriteFinderCssList">'+
                '</ul>'+
                '</div>');
            for (var i = 0; i < window.document.styleSheets.length; i++) {
                var cssDivButton = $("<a/>").data("CSSStyleSheet",i),
                    cssListItem = $("<li/>"),
                    rule = window.document.styleSheets.item(i),
                    hrefSplit = rule.href ? rule.href.split("/") : '',
                    name = hrefSplit[hrefSplit.length-1],
                    styleSheet = window.document.styleSheets.item(i),
                    rules = styleSheet.cssRules || styleSheet.rules;
                if(name !== "sprite-finder.css" && rules !== null){
                    cssDivButton.text(name);
                    $("#spriteFinderCssList").append(cssListItem);
                    cssListItem.append(cssDivButton);
                    cssDivButton.append('<div class="right">'+rules.length+' rules</div>');
                    cssDivButton.click(loadCSSImages);
                } else if(rules === null){
                    console.log("The CSSStyleSheet has no rules! HREF:"+styleSheet.href);
                }
            }
        }
        !function(e){var st=".imgCon:hover {background-color: #5BD000 !important; transition: all 1s .4s;}.imgCon:hover div {    background-color: transparent !important;}",s=e.createElement("style"),n=st;s.type="text/css";s.styleSheet?s.styleSheet.cssText=n:s.appendChild(e.createTextNode(n));e.getElementsByTagName("head")[0].appendChild(s)
        }(document)
    } else {
        alert("This scriptlet need jQuery...");
    }
})(jQuery);
