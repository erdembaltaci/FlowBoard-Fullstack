using JiraProject.Business.Abstract;
using JiraProject.DataAccess.Contexts;
using System.Threading.Tasks;

namespace JiraProject.DataAccess.Concrete
{
    /// <summary>
    /// IUnitOfWork arayüzünü uygulayan ve veritabanı işlemlerinin
    /// bütünlüğünü sağlayan somut sınıf.
    /// </summary>
    public class UnitOfWork : IUnitOfWork
    {
        private readonly JiraProjectDbContext _context;

        /// <summary>
        /// UnitOfWork oluşturulduğunda, çalışması için bir veritabanı
        /// bağlantısına (DbContext) ihtiyaç duyar.
        /// </summary>
        /// <param name="context">Dependency Injection ile gelen DbContext.</param>
        public UnitOfWork(JiraProjectDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Değişiklikleri kaydetmek için DbContext'in SaveChangesAsync metodunu çağırır.
        /// </summary>
        public async Task<int> CompleteAsync()
        {
            return await _context.SaveChangesAsync();
        }

        /// <summary>
        /// UnitOfWork nesnesi ile iş bittiğinde DbContext kaynağını serbest bırakır.
        /// </summary>
        public void Dispose()
        {
            _context.Dispose();
        }
    }
}