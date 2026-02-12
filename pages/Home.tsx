import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '../components/Button';
import { Model3DViewer } from '../components/Model3DViewer';

export const Home: React.FC = () => {
  const [modelLoaded, setModelLoaded] = React.useState(false);
  const [isModelLoading, setIsModelLoading] = React.useState(true);

  const handleModelLoaded = React.useCallback(() => {
    setModelLoaded(true);
    setIsModelLoading(false);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20 pt-8 lg:pt-16 pb-20 min-h-[calc(100vh-140px)]">

      {/* Left Content */}
      <div className="flex-1 w-full space-y-6 text-center lg:text-left z-10 flex flex-col items-center lg:items-start">
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-[1.1] font-bold text-brand-dark tracking-tight">
            Turn Your Photos Into <br className="hidden lg:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-purple-500">3D-Styled Cartoon Statues</span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-brand-lightText leading-relaxed max-w-2xl mx-auto lg:mx-0 font-light">
            Transform your photos into stunning custom 3D-styled cartoon statues. <br className="hidden lg:block" />
            <span className="text-brand-text font-medium">Order your personalized 3D figure today!</span>
          </p>
        </div>

        <div className="flex flex-col gap-8 w-full max-w-md lg:max-w-none items-center lg:items-start">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link to="/order" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto px-12 py-5 text-xl shadow-xl shadow-brand-blue/20 hover:shadow-brand-blue/40 transform hover:-translate-y-1 transition-all">
                Order Now
              </Button>
            </Link>
          </div>

          {/* Feature List */}
          <div className="flex gap-8 justify-center lg:justify-start text-base text-brand-lightText font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
              <span>High Detail 3D Print</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
              <span>Premium Finish</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Content - Images */}
      <div className="flex-1 relative w-full flex justify-center lg:justify-end mt-12 lg:mt-0">
        <div className="relative z-10 w-full max-w-[720px] aspect-[3/4] flex justify-center items-center">
          <div className="relative w-full h-full rounded-2xl overflow-hidden">
            <div className={modelLoaded ? 'absolute inset-0 opacity-100 transition-opacity duration-300' : 'absolute inset-0 opacity-0 pointer-events-none transition-opacity duration-300'}>
              <Model3DViewer
                modelPath="/models/anand.glb"
                autoRotate={true}
                onModelLoaded={handleModelLoaded}
              />
            </div>
            {!isModelLoading && (
              <img
                src="/models/anand.png"
                alt="3D Cartoon Statue Preview"
                className={modelLoaded ? 'w-full h-full object-contain rounded-2xl opacity-0 transition-opacity duration-300' : 'w-full h-full object-contain rounded-2xl opacity-100 transition-opacity duration-300'}
              />
            )}
          </div>
        </div>
        {/* Decorative Blob */}
        <div className="absolute top-1/2 left-1/2 lg:left-auto lg:right-0 transform -translate-x-1/2 lg:translate-x-0 -translate-y-1/2 w-[140%] h-[140%] max-w-[800px] max-h-[800px] bg-gradient-to-tr from-brand-blue/10 via-purple-50 to-white rounded-full blur-3xl -z-10 opacity-70 mix-blend-multiply"></div>
      </div>
    </div>
  );
};