import Image from "next/image";

export default function SuccesPage() {
  return <main className="min-h-screen bg-[#141b18] px-5 py-12 text-[#f7f5ef]">
    <div className="mx-auto flex min-h-[80vh] max-w-3xl flex-col items-center justify-center text-center">
      <Image src="/brand/signature-ac.png" alt="AC, Arnaud Crestey" width={2000} height={2000} className="mb-3 h-44 w-44 object-contain" />
      <p className="eyebrow">VOTRE POINT DE DÉPART</p>
      <h1 className="font-[Instrument_AC,Georgia,serif] text-5xl font-normal sm:text-7xl">Merci pour votre confiance</h1>
      <p className="mt-7 max-w-xl text-lg leading-8 text-[#d6dbd2]">Vos réponses ont été transmises. Une copie de votre récapitulatif vous a été envoyée à l’adresse indiquée. Nous reprendrons ensemble les points qui restent ouverts.</p>
      <a href="https://www.arnaudcrestey.com/" className="button mt-10 bg-[#dbc699] text-[#141b18]">Découvrir Arnaud Crestey</a>
    </div>
  </main>;
}
