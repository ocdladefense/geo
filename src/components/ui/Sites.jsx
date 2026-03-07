import useModal from '../hooks/useModal.js';
import Modal from './Modal.jsx';


const ProductionSites = [
    ["OCDLA Business Website", "https://ocdla.org"],
    ["Library of Defense", "https://libraryofdefense.ocdla.org"],
    ["OCDLA Store", "https://ocdla.my.site.com"],
    ["OCDLA App", "https://ocdla.app"],
    ["OCDLA Media App", "https://media.ocdla.org"],
    ["Books Online", "https://bon.ocdla.org"],
    ["ORS", "https://ors.ocdla.org"]
];

const DevelopmentSites = [
    ["AppTest", "https://appdev.ocdla.org"],
    ["Legislative District Lookup", "https://bon.ocdla.org/map.html"],
    ["Publishing Platform", "https://publish.ocdla.org"],
    ["Books Online Prototype 1", "https://pubs.ocdla.org"],
    ["Books Online Prototype 2", "https://bonproto2.ocdla.org"],
    ["Biere Library React Website", "https://thebierelibrary2.ocdla.org/"],
    ["Biere Library Test Website", "https://thebierelibrary.ocdla.org/"],
    ["LOD2 Development", "https://lod2.ocdla.org"],
    ["Ciderworks", "https://ciderworks.ocdla.org/"],
    ["Water Street Market Apartments", "https://waterstreetmarketapartments.com"]
];

export default function Sites() {




    return (
        <div className="grid grid-cols-8 gap-4 bg-white">

            <div className="col-span-8 p-4">

                <div className="toc sticky top-0">

                    <h2 className="text-xl font-bold">Production Sites</h2>
                    <ul className="toc-contents">
                        {ProductionSites.map(([name, url]) => (

                            <li className="toc-entry mb-2 border-b border-gray-200 py-6">
                                <a className="cursor-pointer" href={url} target="_new">
                                    <span className="block font-bold">{name}</span>
                                    <span className="block">{url}</span>
                                </a>
                            </li>
                        ))}
                    </ul>


                    <h2 className="text-xl font-bold">Development Sites</h2>
                    <ul className="toc-contents">
                        {DevelopmentSites.map(([name, url]) => (

                            <li className="toc-entry mb-2 border-b border-gray-200 py-6">
                                <a className="cursor-pointer" href={url} target="_new">
                                    <span className="block font-bold">{name}</span>
                                    <span className="block">{url}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

        </div>
    );
};

