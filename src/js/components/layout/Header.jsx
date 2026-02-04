
import MenuTop from "../navigation/MenuTop";
import MenuMobile from "../navigation/MenuMobile";
import Hamburger from "../navigation/Hamburger";


export default function Header({ loggedIn = false }) {



    let items = [
        {
            url: "/",
            label: "home"
        },
        {
            url: "/settings",
            label: "settings",
            hidden: true
        }
    ];

    let loginItem = {
        url: "/login",
        label: "login",
        hidden: true,
        // loggedIn: loggedIn
    };

    let logoutItem = {
        url: "/logout",
        label: "logout",
        hidden: true,
        // loggedIn: loggedIn
    };

    if (loggedIn) {
        console.log("User is logged in");
        items.push(logoutItem);
    } else {
        console.log("User is NOT logged in");
        items.push(loginItem);
    }

    // 

    return (
        <header className="w-full mb-0 py-1 sticky top-0 z-50 bg-white">
            <nav>

                <ul className="inline-block" style={{ width: "100%" }}>

                    <li style={{ verticalAlign: "middle" }} className="inline-block">
                        <a href="/">
                            <img className="phone:w-[150px] desktop:w-[200px]" style={{ display: "inline-block", verticalAlign: "middle" }} src="/images/logos/logo.png" />
                        </a>
                    </li>

                    <MenuTop items={items} />

                    <li style={{ float: "right" }} className={`hidden phone:hidden tablet:inline-block`}>
                        <Hamburger />
                    </li>
                </ul>

                <ul id="mobile-menu" className="text-slate-50 block hidden min-h-[100vh] pt-[15vh]">
                    <MenuMobile items={items} />
                </ul>
            </nav>

        </header>
    );
}
