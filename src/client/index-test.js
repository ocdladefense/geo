function Foobar({ baz }) {

    console.log(baz);
    return document.createElement("div");
}


let baz = <Foobar baz="quux" />;

console.log(baz);
