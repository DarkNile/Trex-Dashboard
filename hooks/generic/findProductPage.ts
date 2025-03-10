import { gql, useApolloClient } from '@apollo/client';
import { useSearchParams, usePathname } from 'next/navigation';
import { useRouter as useNextRouter } from 'next/navigation';
const GET_PRODUCTS = gql`
  query AllProducts($page: Int!) {
    allProducts(pageable: { page: $page }, deleted: { deleted: false }) {
      totalSize
      totalPages
      pageSize
      pageNumber
      data {
        _id
        HSCode
        nameEn
        nameAr
        noteEn
        noteAr
        defaultDutyRate
        serviceTax
        adVAT
        deletedAt
        createdAt
        updatedAt
        agreements {
          _id
          reducedDutyRate
          agreementId {
            _id
            name
            note
            deletedAt
            createdAt
            updatedAt
            countryIds {
              _id
              nameEn
              nameAr
              code
              deletedAt
            }
          }
          applyGlobal
        }
        subChapterId {
          _id
          nameEn
          nameAr
          deletedAt
          createdAt
          updatedAt
          chapterId {
            _id
            nameEn
            nameAr
            deletedAt
            createdAt
            updatedAt
          }
        }
        measurementUnit {
          _id
          unitNameAr
          unitNameEn
        }
        scheduleTaxes {
          min
          max
          fee
          enhancementFee
        }
      }
    }
  }
`;

const GET_CHAPTERS = gql`
  query GetChapters($page: Int!) {
    getChapters(extraFilter: { deleted: false }, pageable: { page: $page }) {
      data {
        _id
        nameEn
        nameAr
        subChapters {
          _id
          nameEn
          nameAr
        }
      }
      totalSize
      totalPages
      pageNumber
      pageSize
    }
  }
`;
const SEARCH_PRODUCTS = gql`
  query SearchProduct(
    $keyword: String
    $chapterId: ID
    $subChapterId: ID
    $page: Int!
  ) {
    searchProduct(
      pageable: { page: $page }
      keyword: $keyword
      chapterId: $chapterId
      subChapterId: $subChapterId
    ) {
      totalSize
      totalPages
      pageSize
      pageNumber
      data {
        _id
        HSCode
        nameEn
        nameAr
        noteEn
        noteAr
        defaultDutyRate
        serviceTax
        adVAT
        deletedAt
        createdAt
        updatedAt
        agreements {
          _id
          reducedDutyRate
          agreementId {
            _id
            name
            note
            deletedAt
            createdAt
            updatedAt
            countryIds {
              _id
              nameEn
              nameAr
              code
              deletedAt
            }
          }
          applyGlobal
        }
        measurementUnit {
          _id
          unitNameAr
          unitNameEn
        }
        scheduleTaxes {
          min
          max
          fee
          enhancementFee
        }
        subChapterId {
          _id
          nameEn
          nameAr
          deletedAt
          createdAt
          updatedAt
        }
      }
    }
  }
`;


type ProductFromAPI = {
    _id: string;
    HSCode: string;
    nameEn: string;
    nameAr: string;
    noteEn: string;
    noteAr: string;
    defaultDutyRate: number;
    serviceTax: boolean;
    adVAT: number;
    subChapterId: {
      _id: string;
    };
    measurementUnit: {
      _id: string;
      unitNameEn: string;
      unitNameAr: string;
      note: string;
    };
    scheduleTaxes: ScheduleTax[];
    agreements: AgreementData[];
  };
  interface ScheduleTax {
    min: number;
    max: number;
    fee: number;
    enhancementFee: number;
  }
  interface AgreementData {
    _id: string;
    reducedDutyRate: number;
    agreementId: {
      _id: string;
      name: string;
    };
    applyGlobal: boolean;
  }
  
  interface ProductData {
    HSCode: string;
    nameEn: string;
    nameAr: string;
    noteEn: string;
    noteAr: string;
    defaultDutyRate: number;
    agreements: AgreementData[];
    scheduleTaxes: ScheduleTax[];
    serviceTax: boolean;
    adVAT: number;
    subChapterId: string;
    type: "regural" | "car";
  }
  
  interface Chapter {
    _id: string;
    nameEn: string;
    nameAr: string;
    subChapters: SubChapter[];
  }
  
  interface SubChapter {
    _id: string;
    nameEn: string;
    nameAr: string;
  }
  
  type Product = ProductFromAPI & { id: string };
// افتراض: كل صفحة تحتوي على 10 منتجات (يمكن تغيير هذا الرقم حسب التكوين الخاص بك)
const STORAGE_KEY = 'product-list-state';

// افتراض: كل صفحة تحتوي على 10 منتجات (يمكن تغيير هذا الرقم حسب التكوين الخاص بك)
const ITEMS_PER_PAGE = 10;
// نخلق هوك جديد لإيجاد الصفحة التي يتواجد فيها المنتج
export const saveListState = (state: {
    page: number;
    keyword?: string;
    chapterId?: string | null;
    subChapterId?: string | null;
  }) => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  };
  
  export const getListState = () => {
    const stateStr = sessionStorage.getItem(STORAGE_KEY);
    if (!stateStr) {
      return { page: 1 };
    }
    return JSON.parse(stateStr);
  };
  
  // نخلق هوك جديد لإيجاد الصفحة التي يتواجد فيها المنتج
  export const useFindProductPage = () => {
    const client = useApolloClient();
    
    return async (productId: string, searchParams?: {
      keyword?: string;
      chapterId?: string | null;
      subChapterId?: string | null;
    }) => {
      // استخدام نفس الاستعلام الذي تستخدمه للبحث
      const query = searchParams?.keyword || searchParams?.chapterId || searchParams?.subChapterId 
        ? SEARCH_PRODUCTS 
        : GET_PRODUCTS;
      
      let currentPage = 1;
      let found = false;
      let totalPages = 1;
      
      // استمر في البحث حتى تجد المنتج أو تصل لنهاية الصفحات
      while (!found && currentPage <= totalPages) {
        try {
          const variables = {
            page: currentPage,
            keyword: searchParams?.keyword || "",
            chapterId: searchParams?.chapterId || null,
            subChapterId: searchParams?.subChapterId || null,
          };
          
          // استخدام Apollo Client مباشرة
          const { data } = await client.query({
            query,
            variables,
            fetchPolicy: 'network-only' // لضمان الحصول على البيانات المحدثة
          });
          
          // استخراج البيانات من النتيجة
          const responseData = variables.keyword || variables.chapterId || variables.subChapterId 
            ? data.searchProduct 
            : data.allProducts;
          
          // تحديث إجمالي الصفحات
          totalPages = responseData.meta.totalPages;
          
          // البحث عن المنتج في هذه الصفحة
          const productExists = responseData.data.some((product: ProductFromAPI) => product._id === productId);
          
          if (productExists) {
            found = true;
            return currentPage;
          }
          
          // الانتقال للصفحة التالية
          currentPage++;
        } catch (error) {
          console.error("Error finding product page:", error);
          return 1; // في حالة الخطأ، نعود للصفحة الأولى
        }
      }
      
      // إذا لم يتم العثور على المنتج، نعود للصفحة الأولى
      return 1;
    };
  };