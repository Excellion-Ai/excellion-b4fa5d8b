import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Award, ArrowLeft, Share2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Certificate {
  id: string;
  student_name: string;
  course_title: string;
  certificate_number: string;
  issued_at: string;
}

export default function CertificatePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCertificate = async () => {
      if (!id) {
        navigate('/my-courses');
        return;
      }

      const { data, error } = await supabase
        .from('certificates')
        .select('id, student_name, course_title, certificate_number, issued_at')
        .eq('id', id)
        .single();

      if (error || !data) {
        toast.error('Certificate not found');
        navigate('/my-courses');
        return;
      }

      setCertificate(data);
      setIsLoading(false);
    };

    fetchCertificate();
  }, [id, navigate]);

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Certificate - ${certificate?.course_title}`,
          text: `I completed ${certificate?.course_title}!`,
          url,
        });
      } catch {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!certificate) {
    return null;
  }

  const issuedDate = format(new Date(certificate.issued_at), 'MMMM d, yyyy');

  return (
    <>
      <Helmet>
        <title>Certificate of Completion | Excellion</title>
        <meta name="description" content={`${certificate.student_name} completed ${certificate.course_title} on Excellion`} />
        <meta property="og:title" content={`Certificate: ${certificate.course_title}`} />
        <meta property="og:description" content={`${certificate.student_name} successfully completed this course`} />
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link 
          to="/my-courses" 
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Courses
        </Link>

        {/* Certificate Card */}
        <div 
          className="relative bg-[#fffdf7] rounded-lg shadow-2xl overflow-hidden"
          style={{ aspectRatio: '1.414' }}
        >
          {/* Gold Border */}
          <div className="absolute inset-0 border-8 border-primary rounded-lg pointer-events-none" />
          
          {/* Corner Decorations */}
          <div className="absolute top-6 left-6 w-12 h-12 border-l-4 border-t-4 border-primary/60" />
          <div className="absolute top-6 right-6 w-12 h-12 border-r-4 border-t-4 border-primary/60" />
          <div className="absolute bottom-6 left-6 w-12 h-12 border-l-4 border-b-4 border-primary/60" />
          <div className="absolute bottom-6 right-6 w-12 h-12 border-r-4 border-b-4 border-primary/60" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center text-gray-800">
            {/* Award Icon */}
            <Award className="h-16 w-16 text-primary mb-4" />
            
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">
              Certificate of Completion
            </h1>
            
            {/* Decorative Line */}
            <div className="w-48 h-1 bg-gradient-to-r from-transparent via-primary to-transparent my-6" />
            
            {/* This certifies */}
            <p className="text-lg text-gray-600 mb-2">This is to certify that</p>
            
            {/* Student Name */}
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 font-serif">
              {certificate.student_name}
            </h2>
            
            {/* Has completed */}
            <p className="text-lg text-gray-600 mb-2">has successfully completed</p>
            
            {/* Course Title */}
            <h3 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-8 max-w-2xl">
              {certificate.course_title}
            </h3>
            
            {/* Decorative Line */}
            <div className="w-32 h-0.5 bg-gray-300 my-4" />
            
            {/* Issue Date */}
            <p className="text-gray-600 mb-2">
              Issued on <span className="font-medium">{issuedDate}</span>
            </p>
            
            {/* Certificate Number */}
            <p className="text-sm text-gray-500 mt-4 font-mono">
              Certificate No: {certificate.certificate_number}
            </p>
            
            {/* Logo Placeholder */}
            <div className="mt-6 flex items-center gap-2 text-primary">
              <Award className="h-5 w-5" />
              <span className="font-semibold">Excellion</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <Button 
            variant="outline"
            onClick={handleShare}
            className="gap-2"
          >
            <Share2 className="h-4 w-4" />
            Share Certificate
          </Button>
          <Button 
            variant="outline"
            onClick={() => toast.info('PDF download coming soon!')}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          <Button 
            onClick={() => navigate('/my-courses')}
            className="bg-primary hover:bg-primary/90"
          >
            Back to My Courses
          </Button>
        </div>
      </div>
      </div>
    </>
  );
}
