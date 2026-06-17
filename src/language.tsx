import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'pt';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
};

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav & General
    'nav.home': 'Tools',
    'nav.history': 'History',
    'nav.about': 'About',
    'footer.tools': 'PDF Tools',
    'footer.image_tools': 'Image Tools',
    'footer.about': 'TurboConverter is a free, secure, and fast online file conversion tool. No registration required.',
    'footer.legal': 'Legal',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    
    // Home
    'home.new_badge': '100% Free & Secure',
    'home.hero_title': 'Easy-to-use File Tools.',
    'home.hero_highlight': 'No limits.',
    'home.hero_subtitle': 'Convert, Merge, Split and Compress PDFs and Images. No installation, no registration, no hidden fees.',
    'home.search_placeholder': "Search tools (e.g., 'Merge PDF', 'Compress Image')",
    'home.find_btn': 'Search',
    'home.no_tools': 'No tools found matching your search.',
    'home.cta_title': 'Simple. Fast. Free.',
    'home.cta_subtitle': 'We believe file tools should be accessible to everyone.',
    'home.cta_btn': 'Start Converting',
    'home.why_us_title': 'Why use TurboConverter?',
    'home.why_speed_title': 'Fast Processing',
    'home.why_speed_desc': 'Optimized algorithms ensure your files are ready in seconds.',
    'home.why_free_title': 'Free Forever',
    'home.why_free_desc': 'No paywalls, no "Pro" plans. Just upload and convert.',
    'home.why_secure_title': 'Secure & Private',
    'home.why_secure_desc': 'Files are processed securely and deleted automatically.',

    // Tool Processor General
    'tool.upload_title': 'Select File',
    'tool.upload_subtitle': 'or drag and drop here',
    'tool.process_btn': 'Process File',
    'tool.processing': 'Working...',
    'tool.success_title': 'Success!',
    'tool.success_msg': 'Your file is ready.',
    'tool.download_file': 'Download File',
    'tool.start_another': 'Convert Another File',
    'tool.seo_title': ' - Free Online Tool',
    'tool.select_multiple': 'Select multiple files allowed',
    'tool.files_selected': 'file(s) selected',
    'tool.add_more': 'Add more files',
    'tool.remove_file': 'Remove',

    // Tool Settings & Errors
    'tool.settings.pages_extract': 'Pages to Extract (e.g., 1,3,5-10)',
    'tool.settings.pages_remove': 'Pages to Remove (e.g., 1,3,5-10)',
    'tool.settings.pages_placeholder': 'e.g. 1-5, 8, 11',
    'tool.settings.leave_empty_split': 'Leave empty to extract all pages into separate files.',
    'tool.settings.leave_empty_remove': 'Leave empty to keep all pages.',
    'tool.settings.password_label': 'Set Password',
    'tool.settings.password_placeholder': 'Enter secure password',
    'tool.settings.unlock_label': 'Current Password',
    'tool.settings.unlock_placeholder': 'Enter the password to unlock',
    'tool.settings.dimensions_label': 'New Dimensions (px)',
    'tool.settings.width': 'Width',
    'tool.settings.height': 'Height',
    'tool.settings.format_label': 'Target Format',
    'tool.settings.quality_label': 'Compression Level',
    'tool.settings.quality_high': 'High Quality (Low Compression)',
    'tool.settings.quality_med': 'Balanced',
    'tool.settings.quality_low': 'Small Size (High Compression)',
    'tool.error.password_required': 'Please enter a password.',
    'tool.error.generic': 'An error occurred during processing.',

    // Categories
    'cat.Popular': 'Popular',
    'cat.Optimize PDF': 'Optimize PDF',
    'cat.Convert to PDF': 'To PDF',
    'cat.Convert from PDF': 'From PDF',
    'cat.PDF Security': 'Security',
    'cat.Image Tools': 'Images',
    'cat.All': 'All Tools',

    // Tool Names
    'tool_merge-pdf_name': 'Merge PDF',
    'tool_merge-pdf_desc': 'Combine multiple PDFs into one unified document.',
    'tool_split-pdf_name': 'Split PDF',
    'tool_split-pdf_desc': 'Separate one page or a whole set.',
    'tool_pdf-to-jpg_name': 'PDF to JPG',
    'tool_pdf-to-jpg_desc': 'Convert PDF pages to JPG images.',
    'tool_jpg-to-pdf_name': 'JPG to PDF',
    'tool_jpg-to-pdf_desc': 'Convert JPG images to PDF.',
    'tool_unlock-pdf_name': 'Unlock PDF',
    'tool_unlock-pdf_desc': 'Remove PDF password security.',
    'tool_protect-pdf_name': 'Protect PDF',
    'tool_protect-pdf_desc': 'Encrypt your PDF with a password.',
    'tool_compress-img_name': 'Compress Image',
    'tool_compress-img_desc': 'Compress JPG, PNG, or GIF.',
    'tool_resize-img_name': 'Resize Image',
    'tool_resize-img_desc': 'Resize image dimensions.',
    'tool_convert-img_name': 'Convert Image',
    'tool_convert-img_desc': 'Switch between image formats.',
    'tool_remove-pages_name': 'Remove Pages',
    'tool_remove-pages_desc': 'Delete specific pages from PDF.',

    // New Tools
    'tool_rotate-pdf_name': 'Rotate PDF',
    'tool_rotate-pdf_desc': 'Rotate specific pages of a PDF by 90°, 180° or 270°.',
    'tool_compress-pdf_name': 'Compress PDF',
    'tool_compress-pdf_desc': 'Reduce PDF file size by optimizing content and stripping metadata.',
    'tool_watermark-pdf_name': 'Add Watermark',
    'tool_watermark-pdf_desc': 'Add a text watermark diagonally across all pages of a PDF.',
    'tool_organize-pdf_name': 'Reorder Pages',
    'tool_organize-pdf_desc': 'Rearrange pages in a PDF by specifying a new page sequence.',
    'tool_pdf-to-word_name': 'PDF to Text',
    'tool_pdf-to-word_desc': 'Extract text content from a PDF into a .txt file.',
    'tool_html-to-pdf_name': 'HTML to PDF',
    'tool_html-to-pdf_desc': 'Convert an HTML file into a downloadable PDF document.',
    'tool_page-numbers_name': 'Add Page Numbers',
    'tool_page-numbers_desc': 'Add sequential page numbers to an existing PDF.',
    'tool_sign-pdf_name': 'Sign PDF',
    'tool_sign-pdf_desc': 'Draw or upload a signature and place it on a specific page.',
    'tool_pdf-reader_name': 'PDF Reader',
    'tool_pdf-reader_desc': 'View PDFs directly in the browser without external software.',
    'tool_word-to-pdf_name': 'Word to PDF',
    'tool_word-to-pdf_desc': 'Convert Word documents (.docx) to PDF.',
    'tool_excel-to-pdf_name': 'Excel to PDF',
    'tool_excel-to-pdf_desc': 'Convert Excel spreadsheets (.xlsx) to PDF.',
    'tool_ppt-to-pdf_name': 'PowerPoint to PDF',
    'tool_ppt-to-pdf_desc': 'Convert PowerPoint presentations (.pptx) to PDF.',
    'tool_png-to-pdf_name': 'PNG to PDF',
    'tool_png-to-pdf_desc': 'Convert PNG images to PDF documents.',
    'tool_pdf-to-png_name': 'PDF to PNG',
    'tool_pdf-to-png_desc': 'Convert each PDF page into a high-quality PNG image.',
    'tool_crop-img_name': 'Crop Image',
    'tool_crop-img_desc': 'Crop your image to a specific area.',
    'tool_grayscale-img_name': 'Grayscale Image',
    'tool_grayscale-img_desc': 'Convert a color image to black and white.',
    'tool_flip-img_name': 'Flip Image',
    'tool_flip-img_desc': 'Flip your image horizontally or vertically.',
    'tool_rotate-img_name': 'Rotate Image',
    'tool_rotate-img_desc': 'Rotate your image by 90°, 180° or 270°.',
  },
  pt: {
    // Nav & General
    'nav.home': 'Ferramentas',
    'nav.history': 'Histórico',
    'nav.about': 'Sobre',
    'footer.tools': 'Ferramentas PDF',
    'footer.image_tools': 'Ferramentas de Imagem',
    'footer.about': 'TurboConverter é uma ferramenta online de conversão de arquivos gratuita, segura e rápida. Sem cadastro.',
    'footer.legal': 'Legal',
    'footer.privacy': 'Privacidade',
    'footer.terms': 'Termos de Uso',

    // Home
    'home.new_badge': '100% Grátis e Seguro',
    'home.hero_title': 'Ferramentas de Arquivo.',
    'home.hero_highlight': 'Sem limites.',
    'home.hero_subtitle': 'Converta, Junte, Divida e Comprima PDFs e Imagens. Sem instalação, sem cadastro, sem taxas escondidas.',
    'home.search_placeholder': "Buscar (ex: 'Juntar PDF', 'Comprimir Imagem')",
    'home.find_btn': 'Buscar',
    'home.no_tools': 'Nenhuma ferramenta encontrada.',
    'home.cta_title': 'Simples. Rápido. Grátis.',
    'home.cta_subtitle': 'Acreditamos que ferramentas de arquivo devem ser acessíveis a todos.',
    'home.cta_btn': 'Começar Agora',
    'home.why_us_title': 'Por que usar o TurboConverter?',
    'home.why_speed_title': 'Processamento Rápido',
    'home.why_speed_desc': 'Algoritmos otimizados garantem que seus arquivos fiquem prontos em segundos.',
    'home.why_free_title': 'Sempre Gratuito',
    'home.why_free_desc': 'Sem "paywalls", sem planos "Pro". Apenas envie e converta.',
    'home.why_secure_title': 'Seguro e Privado',
    'home.why_secure_desc': 'Arquivos processados de forma segura e deletados automaticamente.',

    // Tool Processor General
    'tool.upload_title': 'Selecionar Arquivo',
    'tool.upload_subtitle': 'ou arraste e solte aqui',
    'tool.process_btn': 'Processar Arquivo',
    'tool.processing': 'Trabalhando...',
    'tool.success_title': 'Sucesso!',
    'tool.success_msg': 'Seu arquivo está pronto.',
    'tool.download_file': 'Baixar Arquivo',
    'tool.start_another': 'Converter Outro',
    'tool.seo_title': ' - Ferramenta Online Grátis',
    'tool.select_multiple': 'Permitido selecionar múltiplos arquivos',
    'tool.files_selected': 'arquivo(s) selecionado(s)',
    'tool.add_more': 'Adicionar mais',
    'tool.remove_file': 'Remover',

    // Tool Settings & Errors
    'tool.settings.pages_extract': 'Páginas para Extrair (ex: 1,3,5-10)',
    'tool.settings.pages_remove': 'Páginas para Remover (ex: 1,3,5-10)',
    'tool.settings.pages_placeholder': 'ex: 1-5, 8, 11',
    'tool.settings.leave_empty_split': 'Deixe vazio para extrair todas as páginas em arquivos separados.',
    'tool.settings.leave_empty_remove': 'Deixe vazio para manter todas as páginas.',
    'tool.settings.password_label': 'Definir Senha',
    'tool.settings.password_placeholder': 'Digite uma senha segura',
    'tool.settings.unlock_label': 'Senha Atual',
    'tool.settings.unlock_placeholder': 'Digite a senha para desbloquear',
    'tool.settings.dimensions_label': 'Novas Dimensões (px)',
    'tool.settings.width': 'Largura',
    'tool.settings.height': 'Altura',
    'tool.settings.format_label': 'Formato de Destino',
    'tool.settings.quality_label': 'Nível de Compressão',
    'tool.settings.quality_high': 'Alta Qualidade (Baixa Compressão)',
    'tool.settings.quality_med': 'Equilibrado',
    'tool.settings.quality_low': 'Tamanho Pequeno (Alta Compressão)',
    'tool.error.password_required': 'Por favor, digite a senha.',
    'tool.error.generic': 'Ocorreu um erro durante o processamento.',

    // Categories
    'cat.Popular': 'Populares',
    'cat.Optimize PDF': 'Otimizar PDF',
    'cat.Convert to PDF': 'Para PDF',
    'cat.Convert from PDF': 'De PDF',
    'cat.PDF Security': 'Segurança',
    'cat.Image Tools': 'Imagens',
    'cat.All': 'Todas',

    // Tool Names
    'tool_merge-pdf_name': 'Juntar PDF',
    'tool_merge-pdf_desc': 'Combine múltiplos PDFs em um único documento.',
    'tool_split-pdf_name': 'Dividir PDF',
    'tool_split-pdf_desc': 'Separe páginas de um documento.',
    'tool_pdf-to-jpg_name': 'PDF para JPG',
    'tool_pdf-to-jpg_desc': 'Converta páginas de PDF em imagens JPG.',
    'tool_jpg-to-pdf_name': 'JPG para PDF',
    'tool_jpg-to-pdf_desc': 'Converta imagens JPG para PDF.',
    'tool_unlock-pdf_name': 'Desbloquear PDF',
    'tool_unlock-pdf_desc': 'Remova a senha de arquivos PDF.',
    'tool_protect-pdf_name': 'Proteger PDF',
    'tool_protect-pdf_desc': 'Criptografe seu PDF com senha.',
    'tool_compress-img_name': 'Comprimir Imagem',
    'tool_compress-img_desc': 'Comprima JPG, PNG ou GIF.',
    'tool_resize-img_name': 'Redimensionar Imagem',
    'tool_resize-img_desc': 'Mude as dimensões da imagem.',
    'tool_convert-img_name': 'Converter Imagem',
    'tool_convert-img_desc': 'Troque entre formatos de imagem.',
    'tool_remove-pages_name': 'Remover Páginas',
    'tool_remove-pages_desc': 'Delete páginas específicas do PDF.',

    // New Tools
    'tool_rotate-pdf_name': 'Girar PDF',
    'tool_rotate-pdf_desc': 'Gire páginas específicas de um PDF em 90°, 180° ou 270°.',
    'tool_compress-pdf_name': 'Comprimir PDF',
    'tool_compress-pdf_desc': 'Reduza o tamanho do arquivo PDF otimizando conteúdo e removendo metadados.',
    'tool_watermark-pdf_name': 'Adicionar Marca d\'Água',
    'tool_watermark-pdf_desc': 'Adicione uma marca d\'água em texto diagonal em todas as páginas do PDF.',
    'tool_organize-pdf_name': 'Reordenar Páginas',
    'tool_organize-pdf_desc': 'Reorganize as páginas de um PDF especificando uma nova sequência.',
    'tool_pdf-to-word_name': 'PDF para Texto',
    'tool_pdf-to-word_desc': 'Extraia o conteúdo de texto de um PDF em um arquivo .txt.',
    'tool_html-to-pdf_name': 'HTML para PDF',
    'tool_html-to-pdf_desc': 'Converta um arquivo HTML em um documento PDF.',
    'tool_page-numbers_name': 'Adicionar Numeração',
    'tool_page-numbers_desc': 'Adicione números de página sequenciais a um PDF existente.',
    'tool_sign-pdf_name': 'Assinar PDF',
    'tool_sign-pdf_desc': 'Desenhe ou envie uma assinatura e posicione em uma página específica.',
    'tool_pdf-reader_name': 'Leitor de PDF',
    'tool_pdf-reader_desc': 'Visualize PDFs diretamente no navegador sem software externo.',
    'tool_word-to-pdf_name': 'Word para PDF',
    'tool_word-to-pdf_desc': 'Converta documentos Word (.docx) em PDF.',
    'tool_excel-to-pdf_name': 'Excel para PDF',
    'tool_excel-to-pdf_desc': 'Converta planilhas Excel (.xlsx) em PDF.',
    'tool_ppt-to-pdf_name': 'PowerPoint para PDF',
    'tool_ppt-to-pdf_desc': 'Converta apresentações PowerPoint (.pptx) em PDF.',
    'tool_png-to-pdf_name': 'PNG para PDF',
    'tool_png-to-pdf_desc': 'Converta imagens PNG em documentos PDF.',
    'tool_pdf-to-png_name': 'PDF para PNG',
    'tool_pdf-to-png_desc': 'Converta cada página do PDF em uma imagem PNG de alta qualidade.',
    'tool_crop-img_name': 'Recortar Imagem',
    'tool_crop-img_desc': 'Recorte sua imagem em uma área específica.',
    'tool_grayscale-img_name': 'Imagem Preto e Branco',
    'tool_grayscale-img_desc': 'Converta uma imagem colorida para preto e branco.',
    'tool_flip-img_name': 'Espelhar Imagem',
    'tool_flip-img_desc': 'Espelhe sua imagem horizontal ou verticalmente.',
    'tool_rotate-img_name': 'Girar Imagem',
    'tool_rotate-img_desc': 'Gire sua imagem em 90°, 180° ou 270°.',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('pt');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
