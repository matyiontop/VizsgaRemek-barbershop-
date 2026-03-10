function Home()
{
    return(
        <div className="kepekegymasmellett" style={{ maxWidth: '1200px', margin: '20px auto', justifyContent: 'center' }}>
            <div style={{ display: 'flex', gap: '20px', maxWidth: '500px' }}>
                <img src="/képek/fodrasz.png" alt="Fodrász" className="home-image" />
                <div>
                    <h2>
                        Rólam
                    </h2>
                    <p>
                        Németh Péter vagyok, fodrász. Számomra a fodrászat nem rutin, hanem alkotás: minden vendég egyedi, így minden frizura személyre szabott. Fontos a minőség, a precizitás és hogy vendégeim elégedetten, magabiztosan távozzanak. Igazítás vagy teljes megújulás – nálam jó kezekben vagy.
                    </p>
                </div>
            </div>
            <div style={{ display: 'flex',  gap: '20px', maxWidth: '500px' }}>
                <img src="/képek/hajvagas.png" alt="haj" className="home-image" />
                <div>
                    <h2>
                        Hajvágás
                    </h2>
                    <p>
                        Hajvágás szolgáltatásaim között megtalálod a gyerek hajvágást, a gyors igazítást, a klasszikus férfi hajvágást, valamint a hosszú haj precíz formára vágását is. Legyen szó frissítésről, fazonigazításról vagy teljes stílusváltásról, minden esetben a hajtípusodhoz és az elképzelésedhez igazítva dolgozom. Célom, hogy a végeredmény ápolt, könnyen kezelhető és hozzád illő legyen.
                    </p>
                </div>
            </div>
        </div>
    );
}
export default Home;