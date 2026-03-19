import tutorInglesImage from "../../assets/64af5bea1f7d7b69df13506b3145a332f5049f18.png";
import tutorMatematicaImage from "../../assets/060c3252628a858a4cfcc538886d6f1d1c5950f1.png";
import tutorGeografiaImage from "../../assets/d0f70ddc6a30f0e98f4af7fa8f7ca896e028f8ff.png";
import tutorFisicaImage from "../../assets/054dfe02e425078fdd66113858fbed2e929f9c10.png";
import tutorHistoriaImage from "../../assets/6c3426f11b33df20ca0ee5541adeebb2cfe1674d.png";

interface SelectTutorScreenProps {
  onSelect: (tutor: string) => void;
}

const tutors = [
  { id: "ingles", name: "Ingles", subtitle: "Maple Bear", image: tutorInglesImage },
  { id: "matematica", name: "Matematica", subtitle: "Leonardo Fibonacci", image: tutorMatematicaImage },
  { id: "geografia", name: "Geografia", subtitle: "Alexander von Humboldt", image: tutorGeografiaImage },
  { id: "fisica", name: "Fisica", subtitle: "Einstein", image: tutorFisicaImage },
  { id: "historia", name: "Historia", subtitle: "Em breve", image: tutorHistoriaImage, disabled: true },
];

export function SelectTutorScreen({ onSelect }: SelectTutorScreenProps) {
  return (
    <div className="relative w-full h-full bg-[#ab4d4d] flex flex-col overflow-y-auto">
      {/* Title */}
      <div className="flex-shrink-0 px-5 sm:px-8 lg:px-12 pt-8 sm:pt-10 lg:pt-12 pb-4 sm:pb-5">
        <h1
          className="text-white text-center text-[clamp(22px,5vw,48px)] leading-[1.1]"
          style={{
            fontFamily: "'Luckiest Guy', cursive",
            textShadow: "3px 3px 6px rgba(0,0,0,0.3)",
          }}
        >
          SELECIONE SEU TUTOR
        </h1>
      </div>

      {/* Tutor cards grid */}
      <div className="flex-1 px-4 sm:px-6 lg:px-10 pb-6 sm:pb-8 lg:pb-10">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5 max-w-[1400px] mx-auto">
          {tutors.map((tutor) => (
            <button
              key={tutor.id}
              onClick={() => !tutor.disabled && onSelect(tutor.id)}
              className={`relative w-full rounded-[14px] sm:rounded-[18px] lg:rounded-[22px] overflow-hidden group ${
                tutor.disabled
                  ? "opacity-50 cursor-not-allowed"
                  : "active:scale-[0.97] hover:scale-[1.02] transition-transform cursor-pointer"
              }`}
              style={{ aspectRatio: "3/4" }}
            >
              {/* Background */}
              <div className={`absolute inset-0 ${tutor.disabled ? "bg-[#ece6f0]" : ""}`}>
                <img
                  alt={`Imagem do tutor ${tutor.name}`}
                  className={`absolute inset-0 w-full h-full ${
                    tutor.disabled ? "mix-blend-luminosity object-contain" : "object-cover"
                  } transition-transform duration-500 group-hover:scale-105`}
                  src={tutor.image}
                />
              </div>

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent pointer-events-none" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 text-left">
                <p
                  className="text-white text-[clamp(16px,3.5vw,32px)] lg:text-[clamp(18px,1.5vw,28px)] leading-[1.1]"
                  style={{ fontFamily: "'Luckiest Guy', cursive" }}
                >
                  {tutor.name}
                </p>
                <p
                  className="text-white/75 text-[clamp(10px,2vw,14px)] lg:text-[clamp(11px,0.9vw,15px)] leading-[1.3] mt-0.5 font-['Inter',sans-serif]"
                >
                  {tutor.subtitle}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
