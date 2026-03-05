import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";



export default function LegislativeAction() {

    let params = useParams();
    let type = params.type;
    let [legislators, setLegislators] = useState([]);

    useEffect(() => {
        fetch(`/legislators/${type}`)
            .then(res => res.json())
            .then(data => {
                setLegislators(data);
            });
    }, []);


    return (
        <div className="grid grid-cols-8 gap-4 bg-white">

            <div className="col-span-8 p-4">


                <h2 className="text-xl font-bold">Oregon {type}</h2>
                <ul className="toc-contents">
                    {legislators.map(legislator => (

                        <li className="toc-entry mb-2 border-b border-gray-200 py-6">
                            <a className="cursor-pointer" target="_new" href={legislator.WebSiteUrl}>
                                <span className="block font-bold">District {legislator.DistrictNumber}</span>
                                <span className="block">{legislator.Title + ' ' + legislator.FirstName + ' ' + legislator.LastName} ({legislator.Party})</span>
                                <span className="block"><a href={`mailto:${legislator.EmailAddress}`}>{legislator.EmailAddress}</a></span>
                                <img src={legislator.ImageUrl} className="w-32 h-auto mt-2" alt={`${legislator.FirstName} ${legislator.LastName}`} />
                            </a>
                        </li>
                    ))}
                </ul>

            </div>

        </div>
    );
};

