function Element(tag, attributes, childs){
    var element = null;

    try{
        element = document.createElement(tag);
        if(attributes){
            for(let attribute in attributes){
                if(['html', 'text'].includes(attribute)){
                    if(attribute == 'html')
                        element.innerHTML = attributes[attribute];
                    else
                        element.innerText = attributes[attribute];
                } else
                    element.setAttribute(attribute, attributes[attribute]);
            }
        }

        if(childs){
            for(let child of childs)
                element.appendChild(child);
        }
    } catch(e){ throw new Error(e); }
    finally{ return element; }
}

export {Element};