

export default function LegislativeActionHome() {


    return (
        <div className="grid grid-cols-8 gap-4 bg-white">

            <div className="col-span-8 p-4">
                <h2 className="text-xl font-bold">Legislative Action</h2>
                <p>Welcome to the Legislative Action section. Please select a category to view the list of Oregon legislators.</p>
                <ul>
                    <li><a href="/action/representatives">Representatives</a></li>
                    <li><a href="/action/senators">Senators</a></li>
                </ul>

            </div>

        </div>
    );
};

