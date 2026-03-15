


export default function MenuTop({ items }) {



    let top = items.map(item => {
        let phoneDisplay = !!item.hidden ? "hidden phone:hidden tablet:inline-block" : "phone:inline-block";
        return (
            <li className={`hidden ${phoneDisplay} px-2 laptop:p-6`} style={{ backgroundColor: "#fff", borderRadius: "15px", marginLeft: "10px" }} key={item.url}>
                {/*<NavLink to={item.url}>{item.label}</NavLink> */}
                <a href={item.url}>
                    <button className={`font-marketing subpixel-antialiased hover:text-wb-cordovan`}>{item.label}</button>
                </a>
            </li>
        );
    });


    return top;
}


