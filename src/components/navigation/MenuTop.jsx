


export default function MenuTop({ items }) {



    let top = items.map(item => {
        let phoneDisplay = !!item.hidden ? "hidden phone:hidden tablet:inline-block" : "phone:inline-block";
        return (
            <li className={`hidden ${phoneDisplay} p-2 laptop:p-6`}>
                {/*<NavLink to={item.url}>{item.label}</NavLink> */}
                <a href={item.url}>
                    <button className={`font-marketing subpixel-antialiased hover:text-wb-cordovan`}>{item.label}</button>
                </a>
            </li>
        );
    });


    return top;
}


